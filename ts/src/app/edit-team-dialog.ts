
import {Component, ViewChild, ElementRef, Inject, NgModule} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatFormField, MatDialogRef, MatSnackBar} from "@angular/material";

@Component({
  selector: 'edit-team-dialog',
  templateUrl: 'edit-team-dialog.html',
})
export class EditTeamDialog {
  constructor(
    public dialogRef: MatDialogRef<EditTeamDialog>,
    public snackBar: MatSnackBar,

  @Inject(MAT_DIALOG_DATA) public data: TeamDialogData) {
  }

  @ViewChild('teamName') teamName: ElementRef;
  @ViewChild('contactName') contactName: ElementRef;
  @ViewChild('contacts') contacts: ElementRef;

  onNoClick(): void {
    this.dialogRef.close();
  }

  validateAndClose(): void {
    let error = null;
    if (this.data.teamName.trim().length == 0) {
      error = "Empty Team name";
      this.teamName.nativeElement.focus();
    } else
    if (this.data.contactName.trim().length == 0) {
      error = "Empty Contact Person name";
      this.contactName.nativeElement.focus();
    } else
    if (this.data.contacts.trim().length == 0) {
      error = "Empty contacts";
      this.contacts.nativeElement.focus();
    }
    if ( error != null) {
      this.snackBar.open('ERROR: '+error,null, {duration: 1500});
    } else {
      this.dialogRef.close(this.data);
    }

  }

  deleteTeam() {
    if (confirm("Really delete?")) {
      this.data.delete = true;
      this.dialogRef.close(this.data);
    }
  }
}

@Component({
  selector: 'help-dialog',
  templateUrl: 'help-dialog.html',
})
export class HelpDialog {
  constructor(
    public dialogRef: MatDialogRef<EditTeamDialog>,
    @Inject(MAT_DIALOG_DATA) public data: TeamDialogData) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}


export interface TeamDialogData {
  teamName: string;
  contactName: string;
  contacts: string;
  teamPageURL: string;
  description: string;
  finalStanding: string;
  writeupURL: string;
  created: number;
  key: string;

  editMode: boolean;
  delete: boolean;

}
