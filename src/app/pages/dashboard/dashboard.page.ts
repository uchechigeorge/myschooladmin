import { Component, OnInit, OnDestroy } from '@angular/core';
import {Chart, registerables, ChartItem, ChartDataset} from "chart.js";
import { StudentService } from 'src/app/services/student.service';
import { TeacherService } from 'src/app/services/teacher.service';
import { CHECK_INTERNET_CON } from 'src/app/components/login/login.component';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit, OnDestroy {

  public yearData: SchoolYear[] = [];
  public noOfStudents: number;
  public noOfActiveStudents: number;
  public noOfInactiveStudents: number;
  public noOfTeachers: number;
  public noOfCourses: number;
  public noOfClasses: number;

  public noOfMaleStudents: number;
  public noOfFemaleStudents: number;
  public noOfOtherStudents: number;
  public reminders: IReminders[] = [];
  public isLoading = true;

  private _chartData: SchoolTerm[] = [];

  get chartData() {
    return this._chartData;
  }

  set chartData(value) {
    this._chartData = value;

    this.initStudentChart();
  }

  public chartElem: any;
  public studentChartCtrl: any;
  public genderChartCtrl: any;

  constructor(
    private studentService: StudentService,
    private teacherService: TeacherService,
    private toastCtrl: ToastController,
  ) { 
    Chart.register(...registerables);
  }

  ngOnInit() {
    
  }

  ionViewWillEnter() {
    this.getChartTerms();
    this.getEntityCount();
  }

  async getChartTerms() {
    this.studentService.viewStudentByTerm({
      updateType: "1",
      pageNum: "1",
      pageSize: "20"
    })
    .subscribe(res => {
      if(res.statuscode == 200) {
        const response = res.dataResponse as Array<any>;
        
        const data: SchoolTerm[] = [];
        response.forEach((term) => {
          data.push({
            id: term.termId,
            term: term.term,// + this.getPosition(term.term) + " Term-" + term.schoolYear,
            year: term.schoolYear,
            yearId: term.sessionId,
          });
        });

        response.forEach(async (term) => {
          const noOfStudents = (await this.getStudentByTerm(term.termId)).totalStudents;
          data.find(chart => chart.id == term.termId).noOfStudents = noOfStudents;
          this.chartData = data;
        });
        
        this.chartData = data;

        return this.chartData;
      }
    });
  }

  tranformData(data: SchoolTerm[]) {
    let years: SchoolYear[] = [];

    data.forEach(d => {
      if(years.some(y => y.id == d.yearId)) {
        const year = years.find(y => y.id == d.yearId);

        year.terms.find(t => t.term == d.term).id = d.id;
        year.terms.find(t => t.term == d.term).noOfStudents = d.noOfStudents;
      }
      else {
        years.push({
          id: d.yearId,
          year: d.year,
          terms: [
            {
              noOfStudents: d.term == "1" ? d.noOfStudents : "0", term: "1", year: d.year, yearId: d.yearId,
            },
            {
              noOfStudents: d.term == "2" ? d.noOfStudents : "0", term: "2", year: d.year, yearId: d.yearId,
            },
            {
              noOfStudents: d.term == "3" ? d.noOfStudents : "0", term: "3", year: d.year, yearId: d.yearId,
            },
          ],
        })
      }
    });

    return years;
  }

  async getStudentByTerm(termId: string) {
    const data = await this.studentService.viewStudentByTerm({
      updateType: "2",
      termId,
    }).toPromise()
    .then(res => {
      if(res.statuscode == 200) {
        const response = res.dataResponse as Array<any>;

        return response[0];
      }
    });

    return data;
  }

  initStudentChart() {

    this.yearData = this.tranformData(this.chartData);
    const className = '.studentChart';
    const chartElem = document.querySelector(className) as ChartItem;

    let first = [];
    let second = [];
    let third = [];
    
    this.yearData.forEach((d, i, arr) => {
     
      d.terms.forEach(t => {
        if(t.term == "1") {
          first.push(t.noOfStudents);
        }
        else if(t.term == "2") {
          second.push(t.noOfStudents);
        }
        else if(t.term == "3") {
          third.push(t.noOfStudents);
        }
      });
    });

    this.studentChartCtrl?.destroy();

    this.studentChartCtrl = new Chart(chartElem, {
      
      type: 'bar',
      data: {
        labels: this.yearData.map(d => d.year),
        datasets: [
          {
            label: "1st term",
            data: first,
            backgroundColor: 'rgba(103, 58, 183, 0.5)',
            borderColor: 'rgba(103, 58, 183, 1)',
            borderWidth: 1
          },
          {
            label: "2nd term",
            data: second,
            backgroundColor: 'rgba(255, 215, 64, 0.5)',
            borderColor: 'rgba(255, 215, 64, 1)',
            borderWidth: 1
          },
          {
            label: "3rd term",
            data: third,
            backgroundColor: 'rgba(235, 68, 90, 0.5)',
            borderColor: 'rgba(235, 68, 90, 1)',
            borderWidth: 1
          }
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          },
        },
        plugins: {
          title: {
            display: true,
            text: "Statistics of active students",
            align: "start",
          }
        }
      }
    });

  }

  initGenderChart() {
    const className = '.genderChart';
    const chartElem = document.querySelector(className) as ChartItem;
    this.genderChartCtrl?.destroy();

    this.genderChartCtrl = new Chart(chartElem, {
      
      type: 'doughnut',
      data: {
        labels: ["Boys", "Girls", "Other"],
        datasets: [
          {
            label: "",
            data: [this.noOfMaleStudents, this.noOfFemaleStudents, this.noOfOtherStudents],
            backgroundColor: ['rgba(103, 58, 183, 0.5)', 'rgba(255, 215, 64, 0.5)', 'rgba(235, 68, 90, 0.5)'],
            borderColor: 'rgba(103, 58, 183, 1)',
            borderWidth: 1,
            hoverOffset: 4
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          },
        },
        plugins: {
          title: {
            display: true,
            text: "Statistics of student gender",
            align: "start",
          }
        }
      }
    });
  
  }

  getEntityCount() {
    this.teacherService.viewEntityCount({ updateType: "1" })
    .subscribe(res => {
      if(res.statuscode == 200) {
        const response = res.dataResponse;
        
        this.noOfStudents = response.noOfStudents || 0;
        this.noOfTeachers = response.noOfTeachers || 0;
        this.noOfCourses = response.noOfCourses || 0;
        this.noOfClasses = response.noOfClasses || 0;
        this.noOfActiveStudents = response.noOfActiveStudents || 0;
        this.noOfInactiveStudents = response.noOfInactiveStudents || 0;
        this.noOfMaleStudents = response.noOfMaleStudents || 0;
        this.noOfFemaleStudents = response.noOfFemaleStudents || 0;
        this.noOfOtherStudents = response.noOfOtherStudents || 0;

        this.initGenderChart();

        this.reminders = [];
        if(response.hasActiveTerm == false) {
          this.reminders.push({
            title: "Alert",
            message: "No active term selected.",
            icon: "alert",
            iconColor: "danger",
            avatarColor: "rgba(235, 68, 90, 0.24)",
          });
        }
        if(response.noOfStudentsWithoutClass > 0) {
          this.reminders.push({
            title: "Alert",
            message: `${ response.noOfStudentsWithoutClass } active student(s) do not have a class.`,
            icon: "alert",
            iconColor: "danger",
            avatarColor: "rgba(235, 68, 90, 0.24)",
          });
        }
        if(response.noOfStudentsWithoutCourse > 0) {
          this.reminders.push({
            title: "Alert",
            message: `${ response.noOfStudentsWithoutCourse } active student(s) have not been enrolled for courses`,
            icon: "alert",
            iconColor: "danger",
            avatarColor: "rgba(235, 68, 90, 0.24)",
          });
        }
        if(response.noOfCoursesWithoutTeachers > 0) {
          this.reminders.push({
            title: "Alert",
            message: `${ response.noOfCoursesWithoutTeachers } course(s) have no teachers`,
            icon: "alert",
            iconColor: "danger",
            avatarColor: "rgba(235, 68, 90, 0.24)",
          });
        }
        if(response.noOfClassesWithoutTeachers > 0) {
          this.reminders.push({
            title: "Alert",
            message: `${ response.noOfClassesWithoutTeachers } class(es) have no teachers`,
            icon: "alert",
            iconColor: "danger",
            avatarColor: "rgba(235, 68, 90, 0.24)",
          });
        }
      }

      this.isLoading = false;
    }, err => {
      this.presentToast(CHECK_INTERNET_CON);
    })
  }

  async refresh(e?) {
    if(this.isLoading) return;
    this.isLoading = true;
    this.getChartTerms();
    this.getEntityCount();

    e?.target.complete()
  }

  getPosition(value: number): string {
    if(isNaN(value)) return "";
    if(value % 100 > 10 && value % 100 < 20) {
      return 'th';
    }
    else if(value % 10 == 1) {
      return 'st';
    }
    else if(value % 10 == 2) {
      return 'nd';
    }
    else if(value % 10 == 3) {
      return 'rd';
    }
    else if(!value){
      return '';
    }
    else {
      return 'th';
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      position: "bottom",
      duration: 3000
    });

    return await toast.present();
  }

  ngOnDestroy() {
  }
}

interface SchoolYear{
  id?: any,
  year?: string,
  terms?: SchoolTerm[],
}

interface SchoolTerm{
  id?: any,
  term?: string,
  year?: string,
  yearId?: string,
  noOfStudents?: string,
}

interface IReminders{
  message?: string;
  title?: string;
  data?: any;
  id?: any;
  icon?: string;
  iconColor?: string;
  avatarColor?: string;
  imgSrc?: string;
  hasImg?: boolean;
  hasHeader?: boolean;
}