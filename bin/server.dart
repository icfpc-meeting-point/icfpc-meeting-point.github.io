import "dart:convert";
import 'dart:io';
import 'dart:math';
import 'dart:async';
import 'package:shelf/shelf_io.dart' as shelf_io;
import 'package:crypto/crypto.dart';
import 'package:shelf_web_socket/shelf_web_socket.dart';

void main() async {

  var rand = new Random(new DateTime.now().millisecondsSinceEpoch);

  generateKey(double lat, double lon) {
    var s = "$lat $lon ${new File("/etc/passwd").readAsStringSync()} icfpc2018yeah ${rand.nextInt(0xFFFFFFFF)} ${rand.nextInt(0xFFFFFFFF)}";
    var bytes = utf8.encode(s);
    return md5.convert(bytes).toString();
  }

  String data = "[]";
  String list_Teams = jsonEncode({"what":"list_teams", "teams": []});
  var myFile = new File('data.txt');


  try {
    data = myFile.readAsStringSync();
    list_Teams = safeResponse(data);
  } catch(e) {
    // nothing
  }

  var serverHANDLER = (server) {

    server.listen((HttpRequest request) {

      WebSocketTransformer.upgrade(request).then((WebSocket ws) {
        ws.listen((stuff) {
          if (stuff is String) {
            var j = jsonDecode(stuff);
            var req = j["request"];
            switch(req) {
              case "list_teams":
                ws.add(list_Teams);
                return;
              case "add_team": {
                var team = j;
                String error = null;
                try {
                  String teamName = team["teamName"];
                  String contactName = team["contactName"];
                  String teamPageURL = team["teamPageURL"];
                  String contacts = team["contacts"];
                  String description = team["description"];
                  double lat = team["lat"];
                  double lng = team["lng"];
                  if ((teamName??"") == "" || (contactName??"") == "" ||  (description??"") == ""
                      || teamName.length > 100 || contactName.length > 100 || teamPageURL.length > 100 || description.length > 512) {
                    error = "Invalid data";
                  } else {
                    var dj = jsonDecode(data);
                    var save = {"teamName": teamName, "contactName": contactName,
                      "teamPageURL": teamPageURL,
                      "contacts": contacts,
                      "description": description,
                      "lat": lat, "lng": lng,
                      "key": generateKey(lat, lng),
                      "created": new DateTime.now().millisecondsSinceEpoch};
                    dj.add(save);
                    data = jsonEncode(dj);
                    myFile.writeAsBytesSync(utf8.encode(data));
                    list_Teams = safeResponse(data);
                    ws.add(jsonEncode({"result": "OK", "request": req, "what": "response", "team": save}));
                  }
                } catch (e) {
                  error = "$e";
                }
                if (error != null) {
                  ws.add(jsonEncode({"error": error, "request": req, "what":"error"}));
                }
                //if (team.hasKey("teamName") )
                break;
              }
              case "edit_team": {
                var team = j;
                String error = null;
                try {
                  String key = team["key"];
                  int created = team["created"];
                  if (team["delete"]) {
                    List<dynamic> dj = jsonDecode(data);
                    for(int i=0; i<dj.length; i++) {
                      var d1 = dj[i];
                      if (d1["created"] == created && d1["key"] == key) {
                        dj.removeAt(i);
                        data = jsonEncode(dj);
                        myFile.writeAsBytesSync(utf8.encode(data));
                        list_Teams = safeResponse(data);
                        ws.add(jsonEncode({"result": "OK", "request": req, "what": "response"}));
                        return;
                      }
                    }
                    error = "Could not delete. Key error or what?";
                  } else {
                    String teamName = team["teamName"];
                    String contactName = team["contactName"];
                    String teamPageURL = team["teamPageURL"];
                    String contacts = team["contacts"];
                    String description = team["description"];
                    String writeupURL = team["writeupURL"];
                    String finalStanding = team["finalStanding"];
                    if ((teamName??"") == "" || (contactName??"") == "" ||  (description??"") == ""
                        || teamName.length > 100 || contactName.length > 100 || (teamPageURL??"").length > 100 || (description??"").length > 512
                        || (writeupURL??"").length > 100 || (finalStanding??"").length > 100
                    ) {
                      error = "Invalid data (too big? too empty?)";
                    } else {
                      List<dynamic> dj = jsonDecode(data);
                      var save = null;
                      for(int i=0; i<dj.length; i++) {
                        var d1 = dj[i];
                        if (d1["created"] == created && d1["key"] == key) {
                          d1["teamName"] = teamName;
                          d1["contactName"] = contactName;
                          d1["teamPageURL"] = teamPageURL;
                          d1["contacts"] = contacts;
                          d1["description"] = description;
                          d1["writeupURL"] = writeupURL;
                          d1["finalStanding"] = finalStanding;
                          save = d1;
                          break;
                        }
                      }
                      if (save == null) {
                        error = "record not found or key is wrong";
                      } else {
                        data = jsonEncode(dj);
                        myFile.writeAsBytesSync(utf8.encode(data));
                        list_Teams = safeResponse(data);
                        ws.add(jsonEncode({"result": "OK", "request": req, "what": "response", "team": save}));
                      }
                    }

                  }
                } catch (e) {
                  error = "$e";
                }
                if (error != null) {
                  ws.add(jsonEncode({"error": error, "request": req, "what":"error"}));
                }
                break;
              }
              default:
                ws.add(jsonEncode({"error": "invalid request","what":"error"}));
            }

          }
        });
      });

    });
  };


  var secure = new File("/etc/letsencrypt/live/san.itl.ua/fullchain.pem");
  var secureExists = await secure.exists();
  if (secureExists) {
    print("Binding secure to port 2019");
    SecurityContext serverContext = new SecurityContext()
      ..useCertificateChain('/etc/letsencrypt/live/san.itl.ua/fullchain.pem')
      ..usePrivateKey('/etc/letsencrypt/live/san.itl.ua/privkey.pem');
    HttpServer
        .bindSecure(InternetAddress.ANY_IP_V4, 2019, serverContext )
        .then(serverHANDLER);
  } else {
    print("Binding insecure to port 2018");
    HttpServer
        .bind(InternetAddress.ANY_IP_V4, 2018 )
        .then(serverHANDLER);
  }




//  shelf_io.serve(handler, '0.0.0.0', 2018).then((server) {
//    print('Serving at ws://${server.address.host}:${server.port}');
//  });
}

String safeResponse(String data) {
  var d = jsonDecode(data);
  for(int i=0; i<d.length; i++) {
    var it = d[i];
    var wh = it["key"].substring(0, 8);
    it["key"] = wh;
  }
  return jsonEncode({"what":"list_teams", "teams": d});
}