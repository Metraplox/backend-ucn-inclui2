import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NotificationsService } from './notifications.service';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  namespace: 'notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NotificationsGateway.name);
  private userConnections = new Map<string, string[]>();

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        this.logger.warn('Client tried to connect without token');
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      if (!userId) {
        client.disconnect();
        return;
      }

      // Store user connection
      client.data.userId = userId;
      const connections = this.userConnections.get(userId) || [];
      connections.push(client.id);
      this.userConnections.set(userId, connections);

      this.logger.log(`Client connected: ${client.id} for user: ${userId}`);

      // Send unread count on connection
      const unreadCount =
        await this.notificationsService.getUnreadCount(userId);
      client.emit('unread_count', { count: unreadCount });
    } catch (error) {
      this.logger.error(`WebSocket authentication error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      // Remove from connections map
      const connections = this.userConnections.get(userId) || [];
      const updatedConnections = connections.filter((id) => id !== client.id);

      if (updatedConnections.length === 0) {
        this.userConnections.delete(userId);
      } else {
        this.userConnections.set(userId, updatedConnections);
      }

      this.logger.log(`Client disconnected: ${client.id} for user: ${userId}`);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('subscribe_notifications')
  handleSubscribeNotifications(client: Socket) {
    const userId = client.data.userId;
    client.join(`user:${userId}:notifications`);
    this.logger.log(`User ${userId} subscribed to notifications`);
    return { success: true };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('mark_notification_read')
  async handleMarkNotificationRead(
    client: Socket,
    payload: { notificationId: string },
  ) {
    try {
      const notification = await this.notificationsService.markAsRead(
        payload.notificationId,
      );
      const userId = client.data.userId;

      // Broadcast updated unread count
      const unreadCount =
        await this.notificationsService.getUnreadCount(userId);
      this.sendToUser(userId, 'unread_count', { count: unreadCount });

      return { success: true, notification };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Utility method to send notification to a specific user across all their connections
  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}:notifications`).emit(event, data);
  }

  // Method to be called from other services to send real-time notifications
  sendNotification(userId: string, notification: any) {
    this.sendToUser(userId, 'new_notification', notification);
    this.sendToUser(userId, 'unread_count', {
      count: this.notificationsService.getUnreadCount(userId),
    });
  }

  // Method to send bulk notifications to multiple users
  sendBulkNotifications(userIds: string[], notification: any) {
    for (const userId of userIds) {
      this.sendNotification(userId, notification);
    }
  }
}
