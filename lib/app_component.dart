import 'dart:html';
import 'dart:async';

import 'package:angular/angular.dart';
import 'package:google_maps/google_maps.dart' as m;
import 'dart:math';

import 'src/todo_list/todo_list_component.dart';

// AngularDart info: https://webdev.dartlang.org/angular
// Components info: https://webdev.dartlang.org/components

@Component(
  selector: 'my-app',
  styleUrls: ['app_component.css'],
  templateUrl: 'app_component.html',
  directives: [TodoListComponent],
)
class AppComponent implements OnInit {
  // Nothing here yet. All logic is in TodoListComponent.

  @ViewChild('mapcanvas')
  Element mapDivElement;
  m.GMap map;
  List<m.Marker> markers;

  @override
  void ngOnInit() {
    try {
      map = new m.GMap(mapDivElement, new m.MapOptions());
    } catch (e) {
      new Future.delayed(Duration(milliseconds: 300), ngOnInit);
      return;
    }
    var r = new Random();
    for(int i=0; i<10; i++) {
      var marker = new m.LatLng(50+r.nextDouble()-0.5, 36+r.nextDouble()-0.5);
      m.Marker markerMe = new m.Marker(new m.MarkerOptions()..position = marker..draggable = false..map = map..label="L${i}");
    }
  }


}
