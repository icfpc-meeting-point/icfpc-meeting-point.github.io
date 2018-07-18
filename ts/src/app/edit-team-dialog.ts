
import {Component, ViewChild, ElementRef, Inject, NgModule} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatFormField, MatDialogRef} from "@angular/material";

@Component({
  selector: 'edit-team-dialog',
  templateUrl: 'edit-team-dialog.html',
})
export class EditTeamDialog {
  constructor(
    public dialogRef: MatDialogRef<EditTeamDialog>,
    @Inject(MAT_DIALOG_DATA) public data: TeamDialogData) {
  }

  onNoClick(): void {
    this.dialogRef.close();
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
