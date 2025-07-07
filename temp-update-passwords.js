db.users.updateMany({}, { 
  $set: { 
    password_hash: '$2b$10$n7bkXSJZEIF4jsot6AFe0.60UnBpAmxiH7BK/AVLZ1WYewSp7kNwa' 
  } 
});
print('✅ Todos los usuarios actualizados con password: password123');
