import { Injectable } from '@angular/core';
import { ICardDetail } from '../models/card-models';
import { IClassModel, ICourseModel } from '../models/entity-model';

@Injectable({
  providedIn: 'root'
})
export class ApiDataService {

  public studentCards: ICardDetail[] = [
    {
      altImage: "icon",
      showImage: true,
      details: { 
        'Name': 'Abraham Great',
        'Class': 'JS2 A',
        'Subjects Offering': '15'
      },
    },
    {
      altImage: "icon",
      showImage: true,
      details: { 
        'Name': 'Ade Moses',
        'Class': 'SS2 C',
        'Subjects Offering': '10'
      },
    },
    {
      altImage: "icon",
      showImage: true,
      details: { 
        'Name': 'Agatha Mercy',
        'Class': 'SS2 C',
        'Subjects Offering': '9'
      },
    },
  ]

  public teachersCards: ICardDetail[] = [
    {
      altImage: "icon",
      showImage: true,
      details: { 
        'Name': 'Lai Mohammed',
        'Class': 'JS2 A',
        'Subjects': 'Physics'
      },
    },
    {
      altImage: "icon",
      showImage: true,
      details: { 
        'Name': 'Obi Laycon',
        'Class': 'Nil',
        'Subjects': 'English +(1 other)'
      },
    },
    {
      altImage: "icon",
      showImage: true,
      details: { 
        'Name': 'Ejemba Friday',
        'Class': 'SS2 C',
        'Subjects': 'History  '
      },
    },
  ]

  public classCards: ICardDetail[] = [
    {
      altImage: "icon",
      showImage: true,
      details: { 
        'Class': 'JS2 A',
        'Teacher': 'Jitsu Khan',
        'No of Students': '30'
      },
    },
    {
      altImage: "icon",
      showImage: true,
      details: { 
        'Class': 'JS3 A',
        'Teacher': 'Obi Kate',
        'No of Students': '50'
      },
    },
    {
      altImage: "icon",
      showImage: true,
      details: { 
        'Class': 'SS2 B',
        'Teacher': 'Ade Oluwa',
        'No of Students': '34'
      },
    },
  ]

  public courseCards: ICardDetail[] = [
    {
      altImage: "text",
      imageText: 'JS2',
      showImage: true,
      details: {
        'Name': 'English',
        'Class': 'JS2',
        'Teacher': 'Aliyu Falz'
      },
    },
    {
      altImage: "text",
      showImage: true,
      imageText: 'SS2',
      details: { 
        'Name': 'English',
        'Class': 'SS2',
        'Teacher': 'Obi Laycon'
      },
    },
    {
      altImage: "text",
      showImage: true,
      imageText: 'SS1',
      details: {
        'Name': 'English',
        'Class': 'SS1',
        'Teacher': 'Ade Omokhoa'
      },
    },
  ]

  public paymentsCards: ICardDetail[] = [
    {
      altImage: "icon",
      showImage: true,
      details: { 
        'Name': 'Kelvin Collins',
        'Class': 'JS1 C',
        'Time of Transaction': '12:09 AM'
      },
    },
    {
      altImage: "icon",
      showImage: true,
      details: { 
        'Name': 'Obi John',
        'Class': 'JS3 A',
        'Time of Transaction': '01:34 AM'
      },
    },
    {
      altImage: "icon",
      showImage: true,
      details: { 
        'Name': 'Sean Wilson',
        'Class': 'SS2 C',
        'Time of Transaction': '7:09 PM, Monday 24, 2024'
      },
    },
  ]

  public teachers: string[] = [
    'Ali Baba',
    'Thierry Henry',
    'N\'golo Kanté',
    'Anayo Harry'
  ]

  public students: string[] = [
    'Abraham Great',
    'Agatha Mercy',
    'Ade Moses',
    'Linus Okere',
  ]

  // public classes: IClassModel = {
  //   'JS 1': ['JS 1A', 'JS 1B', 'JS 1C'],
  //   'JS 2': ['JS 2A', 'JS 2B', 'JS 2C'],
  //   'JS 3': ['JS 3A', 'JS 3B', 'JS 3C'],
  //   'SS 1': ['SS 1A', 'SS 1B', 'SS 1C'],
  //   'SS 2': ['SS 2A', 'SS 2B', 'SS 2C'],
  //   'SS 3': ['SS 3A', 'SS 3B', 'SS 3C'],
  // }

  public classes: IClassModel[] = [
    {
      class: 'JS 1',
      children: ['JS 1A', 'JS 1B', 'JS 1C']
    },
    {
      class:'JS 2',
      children: ['JS 2A', 'JS 2B', 'JS 2C'],
    },
    {
      class: 'JS 3',
      children: ['JS 3A', 'JS 3B', 'JS 3C'],
    },
    {
      class: 'SS 1',
      children: ['SS 1A', 'SS 1B', 'SS 1C'],
    },
    {
      class: 'SS 2',
      children: ['SS 2A', 'SS 2B', 'SS 2C'],
    },
    {
      class: 'SS 3',
      children: ['SS 3A', 'SS 3B', 'SS 3C'],
    }
  ]

  public courses: ICourseModel[] = [
    { name: 'Physics', class: 'SS1' },
    { name: 'Physics', class: 'SS2' },
    { name: 'Physics', class: 'SS3' },
    { name: 'Biology', class: 'SS1' },
    { name: 'Biology', class: 'SS2' },
    { name: 'Biology', class: 'SS3' },
    { name: 'Chemistry', class: 'SS1' },
    { name: 'Chemistry', class: 'SS2' },
    { name: 'Chemistry', class: 'SS3' },
  ]

  constructor() { }

  getTeacherCards() {
    return this.teachersCards;
  }

  getStudentCards() {
    return this.studentCards;
  }

  getPaymentCards() {
    return this.paymentsCards;
  }

  getCourseCards() {
    return this.courseCards;
  }

  getClassCards() {
    return this.classCards;
  }

  getTeachers() {
    return this.teachers;
  }

  getClasses() {
    return this.classes;
  }

  getCourses() {
    return this.courses;
  }

  getStudents() {
    return this.students;
  }
}
