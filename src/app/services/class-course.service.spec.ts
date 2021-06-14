import { TestBed } from '@angular/core/testing';

import { ClassCourseService } from './class-course.service';

describe('ClassCourseService', () => {
  let service: ClassCourseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClassCourseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
