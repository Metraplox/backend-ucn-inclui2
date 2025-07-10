@JS('google.accounts.id')
library;

import 'package:js/js.dart';

@JS()
external void initialize(GsiConfig config);

@JS()
external void prompt();

@JS()
@anonymous
class GsiConfig {
  external String get client_id;
  external Function get callback;
  external bool get auto_select;

  external factory GsiConfig({
    String client_id,
    Function callback,
    bool auto_select,
  });
}
