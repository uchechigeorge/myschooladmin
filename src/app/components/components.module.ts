import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WebcamModule } from "ngx-webcam";

import { LoginComponent } from './login/login.component';
import { MaterialModule } from '../helpers/material.module';
import { LoginTitleComponent } from './svgs/login-title/login-title.component';
import { LoginLogoComponent } from './svgs/login-logo/login-logo.component';
import { DetailCardComponent } from './detail-card/detail-card.component';
import { HomeCardComponent } from './home-card/home-card.component';
import { ExpansionCardsComponent } from './expansion-cards/expansion-cards.component';
import { RadioPopoverComponent } from './popovers/radio-popover/radio-popover.component';
import { AddClassComponent } from './modals/add/add-class/add-class.component';
import { AddCourseComponent } from './modals/add/add-course/add-course.component';
import { AddStudentComponent } from './modals/add/add-student/add-student.component';
import { AddTeacherComponent } from './modals/add/add-teacher/add-teacher.component';
import { ViewStudentComponent } from './modals/view/view-student/view-student.component';
import { ViewTeacherComponent } from './modals/view/view-teacher/view-teacher.component';
import { ViewClassComponent } from './modals/view/view-class/view-class.component';
import { ViewCourseComponent } from './modals/view/view-course/view-course.component';
import { ModalHeaderComponent } from './modals/modal-header/modal-header.component';
import { ProfilePictureComponent } from './modals/profile-picture/profile-picture.component';
import { EditDetailsInputComponent } from './edit-details-input/edit-details-input.component';
import { ViewProfilePicComponent } from './view-profile-pic/view-profile-pic.component';
import { ViewSubClassComponent } from './modals/view/view-sub-class/view-sub-class.component';
import { ViewPaymentsComponent } from './modals/view/view-payments/view-payments.component';
import { SharedDirectivesModule } from '../directives/shared-directives.module';
import { ResetPasswordComponent } from './modals/reset-password/reset-password.component';
import { ManageAdminsComponent } from './modals/manage-admins/manage-admins.component';
import { SetAdminRolesComponent } from './modals/set-admin-roles/set-admin-roles.component';
import { DesktopCamComponent } from './desktop-cam/desktop-cam.component';
import { DeskShotComponent } from './modals/desk-shot/desk-shot.component';
import { AddSessionComponent } from './modals/add/add-session/add-session.component';
import { AddTermComponent } from './modals/add/add-term/add-term.component';
import { ViewSessionComponent } from './modals/view/view-session/view-session.component';
import { ViewTermComponent } from './modals/view/view-term/view-term.component';
import { AddPaymentComponent } from './modals/add/add-payment/add-payment.component';
import { ViewStudentPaymentComponent } from './modals/view/view-student-payment/view-student-payment.component';
import { AddStudentPaymentComponent } from './modals/add/add-student-payment/add-student-payment.component';
import { ViewSpecificFeesComponent } from './modals/view/view-specific-fees/view-specific-fees.component';
import { SearchSpecificFeesComponent } from './modals/view/search-specific-fees/search-specific-fees.component';
import { EditGeneralFeesComponent } from './modals/view/edit-general-fees/edit-general-fees.component';
import { EditSpecificFeesComponent } from './modals/view/edit-specific-fees/edit-specific-fees.component';
import { RecoveryEmailComponent } from './modals/recovery-email/recovery-email.component';
import { ForgotPasswordComponent } from './modals/forgot-password/forgot-password.component';
import { ViewGradeComponent } from './modals/view/view-grade/view-grade.component';
import { EditGradeComponent } from './modals/view/edit-grade/edit-grade.component';
import { AddGradeComponent } from './modals/add/add-grade/add-grade.component';
import { AddNotificationComponent } from './modals/add/add-notification/add-notification.component';
import { NotificationItemComponent } from './notification-item/notification-item.component';
import { ViewNotificationComponent } from './modals/view/view-notification/view-notification.component';
import { SchoolTitleComponent } from './svgs/school-title/school-title.component';
import { AddStudentLogoComponent } from './svgs/add-student-logo/add-student-logo.component';
import { ListItemPopoverComponent } from './popovers/list-item-popover/list-item-popover.component';
import { ViewStudentRequestComponent } from './modals/view/view-student-request/view-student-request.component';
import { EditStudentRequestComponent } from './modals/view/edit-student-request/edit-student-request.component';


@NgModule({
  declarations: [
    LoginComponent,
    LoginTitleComponent,
    SchoolTitleComponent,
    LoginLogoComponent,
    AddStudentLogoComponent,
    DetailCardComponent,
    HomeCardComponent,
    ExpansionCardsComponent,
    ListItemPopoverComponent,
    RadioPopoverComponent,
    AddClassComponent,
    AddCourseComponent,
    AddStudentComponent,
    AddTeacherComponent,
    ViewStudentComponent,
    ViewTeacherComponent,
    ViewClassComponent,
    ViewSubClassComponent,
    ViewCourseComponent,
    ModalHeaderComponent,
    ProfilePictureComponent,
    EditDetailsInputComponent,
    ViewProfilePicComponent,
    ResetPasswordComponent,
    ManageAdminsComponent,
    SetAdminRolesComponent,
    DesktopCamComponent,
    DeskShotComponent,
    AddSessionComponent,
    AddTermComponent,
    ViewTermComponent,
    ViewSessionComponent,
    AddNotificationComponent,
    AddPaymentComponent,
    AddStudentPaymentComponent,
    ViewPaymentsComponent,
    ViewStudentPaymentComponent,
    ViewSpecificFeesComponent,
    SearchSpecificFeesComponent,
    ViewSpecificFeesComponent,
    EditGeneralFeesComponent,
    EditSpecificFeesComponent,
    RecoveryEmailComponent,
    ForgotPasswordComponent,
    NotificationItemComponent,
    ViewGradeComponent,
    AddGradeComponent,
    EditGradeComponent,
    ViewNotificationComponent,
    ViewStudentRequestComponent,
    EditStudentRequestComponent,
  ],
  exports: [
    LoginComponent,
    LoginTitleComponent,
    SchoolTitleComponent,
    AddStudentLogoComponent,
    LoginLogoComponent,
    DetailCardComponent,
    HomeCardComponent,
    ExpansionCardsComponent,
    ListItemPopoverComponent,
    RadioPopoverComponent,
    AddClassComponent,
    AddCourseComponent,
    AddStudentComponent,
    AddTeacherComponent,
    ViewStudentComponent,
    ViewTeacherComponent,
    ViewClassComponent,
    ViewSubClassComponent,
    ViewCourseComponent,
    ModalHeaderComponent,
    ProfilePictureComponent,
    EditDetailsInputComponent,
    ViewProfilePicComponent,
    ResetPasswordComponent,
    ManageAdminsComponent,
    SetAdminRolesComponent,
    DesktopCamComponent,
    DeskShotComponent,
    AddSessionComponent,
    AddTermComponent,
    ViewTermComponent,
    ViewSessionComponent,
    AddNotificationComponent,
    AddPaymentComponent,
    AddStudentPaymentComponent,
    ViewPaymentsComponent,
    ViewStudentPaymentComponent,
    ViewSpecificFeesComponent,
    SearchSpecificFeesComponent,
    ViewSpecificFeesComponent,
    EditGeneralFeesComponent,
    EditSpecificFeesComponent,
    RecoveryEmailComponent,
    ForgotPasswordComponent,
    NotificationItemComponent,
    ViewGradeComponent,
    AddGradeComponent,
    EditGradeComponent,
    ViewNotificationComponent,
    ViewStudentRequestComponent,
    EditStudentRequestComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    SharedDirectivesModule,
    WebcamModule,
  ]
})
export class ComponentsModule { }
