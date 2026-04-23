import 'auth_bridge_base.dart';
import 'auth_bridge_io.dart'
    if (dart.library.html) 'auth_bridge_web.dart'
    as bridge_impl;

export 'auth_bridge_base.dart';

AuthBridge createAuthBridge() => bridge_impl.createAuthBridge();
