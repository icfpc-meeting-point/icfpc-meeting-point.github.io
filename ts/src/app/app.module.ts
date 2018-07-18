import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {EditTeamDialog, HelpDialog} from "./edit-team-dialog";


import {
  MatFormField,
  MatAutocompleteModule,
  MatBadgeModule,
  MatBottomSheetModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatDividerModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatStepperModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatTreeModule, MatFormFieldModule,
} from '@angular/material';
import {FormsModule, NgModel, ReactiveFormsModule} from "@angular/forms";

@NgModule({
  declarations: [
    AppComponent, EditTeamDialog, HelpDialog
  ],
  imports: [
    BrowserModule,
    MatSidenavModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    BrowserAnimationsModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    FormsModule,
  ],
  exports: [
    AppComponent, EditTeamDialog
  ],
  entryComponents: [AppComponent, EditTeamDialog, HelpDialog],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
