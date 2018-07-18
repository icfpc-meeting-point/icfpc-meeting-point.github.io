import {Component, ViewChild, ElementRef, Inject, NgModule, ChangeDetectorRef} from '@angular/core';
import {} from '@types/googlemaps';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSnackBar, MatSnackBarConfig} from "@angular/material";
import {TeamDialogData, EditTeamDialog, HelpDialog} from "./edit-team-dialog";
import {ReconnectingWebSocket} from "./reconnecting-websocket";
import LatLng = google.maps.LatLng;



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  mapCanvas: HTMLElement;
  map: google.maps.Map;
  @ViewChild('btn') btn: ElementRef;
  currentData: TeamDialogData = null;
  ws: ReconnectingWebSocket = null;
  ll: google.maps.LatLng;
  inButton = () => {};
  data: TeamDialogData = AppComponent.createBlankTeamData();
  isOpen = false;

  clearData() {
    this.data = AppComponent.createBlankTeamData();
  }


  static createBlankTeamData() : TeamDialogData {
    return {teamName: "", contactName: "", contacts: "", teamPageURL: "", delete: false,
      description: "", finalStanding: "", writeupURL: "", editMode: false, key: "", created: 0}
  }

  constructor(public dialog: MatDialog,
              private cdr: ChangeDetectorRef,
              public snackBar: MatSnackBar
              ) {

  }

  openDialog(): void {
    this.inButton();
    this.inButton = () => {};
  }

  openEditTeamDialog() {
    console.log("open dialog: "+this.btn);
    const dialogRef = this.dialog.open(EditTeamDialog, {
      width: Math.min(window.innerWidth, 600)+"px",
      data: this.currentData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('The dialog was closed: ' + JSON.stringify(result));
        let d = JSON.parse(JSON.stringify(result));
        d.request = "add_team";
        console.log("this.ll=" + this.ll)
        d.lat = this.ll.lat();
        d.lng = this.ll.lng();
        d.key = localStorage.getItem("icfpc-meeting-key");
        this.ws.send(JSON.stringify(d))
      }
      // this.animal = result;
    });
  }

  showDetails(data): void {
    let myKey : String = localStorage.getItem("icfpc-meeting-key");
    if (myKey != null && myKey.startsWith(data.key)) {
      data.key = myKey;
      data.editMode = true;
      const dialogRef = this.dialog.open(EditTeamDialog, {
        width: Math.min(window.innerWidth, 600)+"px",
        data: data
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          let d = JSON.parse(JSON.stringify(result));
          d.request = "edit_team";
          this.ws.send(JSON.stringify(d))
        }
      });
    } else {
      this.data = data;
/*
      const dialogRef = this.dialog.open(ViewTeamDialog, {
        width: Math.min(window.innerWidth, 600)+"px",
        data: data
      });
*/
    }
  }

  createdMarkers : Array<google.maps.Marker> = [];


  addMarkers(list, replace: boolean) {
    if (replace) {
      for (let e of this.createdMarkers) {
        e.setMap(null);
      }
      this.createdMarkers = [];
    }
    for(let i=0; i<list.length; i++) {
      let marker = new google.maps.Marker({
        map: this.map,
        position: { lat: list[i].lat, lng: list[i].lng },
        label: list[i].teamName,
      });
      marker.set("data", list[i]);
      this.createdMarkers.push(marker);
      marker.addListener("click", (e: MouseEvent) => {
        this.inButton = () => {
          console.log("show details");
          this.showDetails(marker.get("data"));
        };
        this.btn.nativeElement.click();
      })
    }
  }

  ngAfterViewInit() {
    this.mapCanvas = document.getElementById("mapcanvas");
    this.map = new google.maps.Map(this.mapCanvas, {center: new google.maps.LatLng(0, 0), zoom: 2});
    this.layout();
    this.map.addListener("click", (event) => {
      if (!this.isOpen) {
        alert("Sorry, unable to connect to backend at this time.");
      } else {
        this.ll = event.latLng;
        this.currentData = AppComponent.createBlankTeamData();
        this.currentData.editMode = false;
        this.inButton = this.openEditTeamDialog;
        this.btn.nativeElement.click();
      }
    });
    this.ws = new ReconnectingWebSocket("wss://san.itl.ua:2019");
    //this.ws = new ReconnectingWebSocket("ws://localhost:2018");
    this.ws.onmessage = (ev: MessageEvent) => {
      let d = JSON.parse(ev.data);
      // console.log("got: "+ev.data);
      switch(d.what) {
        case "error":
          this.snackBar.open('Error has occured: '+d.error, null, {duration: 3500});
          break;
        case "list_teams":
          this.addMarkers(d.teams, true);
          break;
        case "response":
          switch(d.request) {
            case "add_team":
              let snack = this.snackBar.open('Team registered successfully',"SHOW KEY", {duration: 2500});
              this.addMarkers([d.team], false);
              let t = d.team.key;
              snack.onAction().subscribe(() => {
                console.log(alert("KEY: "+t));
              });
              localStorage.setItem("icfpc-meeting-key", t);
              break;
            case "edit_team":
              snack = this.snackBar.open('Team changed successfully, wait till reload...',null, {duration: 2500});
              this.ws.send(JSON.stringify({request: "list_teams"}));
              break;
            default:
              this.snackBar.open('Success!', null, {duration: 5000});
              break;
          }
      }
      // console.log("got event: "+ev.data)
    };
    this.ws.onopen = (ev: Event) => {
      console.log("sending hello");
      this.ws.send(JSON.stringify({request: "list_teams"}));
      this.isOpen = true;
    }
    if (localStorage.getItem("help_shown") == null) {
      this.showHelp();
      localStorage.setItem("help_shown","yes");
    }
  }


  layout(): void {
    console.log("ofh="+this.mapCanvas.offsetHeight);
    console.log("ch="+window.innerHeight);
    console.log("bh="+document.body.offsetHeight);
    this.mapCanvas.style.height = ""+(this.mapCanvas.offsetHeight + window.innerHeight-document.body.offsetHeight-3)+"px";
  }


  showHelp() {
    let dialogRef = this.dialog.open(HelpDialog, {
      width: Math.min(window.innerWidth, 600)+"px"
    });
    dialogRef.afterClosed().subscribe(result => {
      if (null == localStorage.getItem("first_help_closed")) {
        localStorage.setItem("first_help_closed", "yes");
        this.showMyLocation();
      }
    });
  }

  openICFPC() {
    document.location.assign('https://icfpcontest2018.github.io');
  }
  showMyLocation() {
    navigator.geolocation.getCurrentPosition((position: Position) => {
      this.map.setCenter(new LatLng(position.coords.latitude, position.coords.longitude));
      this.map.setZoom(7);
    }, (err: PositionError) => {
      alert(err.message);
    });
  }

  enterKey() {
    let key = localStorage.getItem("icfpc-meeting-key");
    if (key == null) key = "";
    let nk = prompt("Your key? Careful with it!", key);
    if (nk) {
      key = nk;
      localStorage.setItem("icfpc-meeting-key", key);
      this.data = AppComponent.createBlankTeamData();
      alert('You can now edits team(s) for this key');
    }

  }

  lines(l: String): Array<String> {
    if (l == null || l.length == 0) return [];
    return l.split("\n");
  }
}




