import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import data  from '../../data.json';
import { CommonModule } from '@angular/common';
import { addDays, differenceInDays } from 'date-fns';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

type ConditionHandler = (field: any) => void;
type AgeGroup = 'infant' | 'child' | 'teenager' | 'young_adult' | 'adult' | 'senior';

interface ConditionHandlers {
  changeAgeRange: ConditionHandler;
  updateDuration: ConditionHandler;
  updateEndDate: ConditionHandler;
}
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  form!: FormGroup;
  formFields: any[] = [];
  
  conditionHandlers: ConditionHandlers = {
    changeAgeRange:this.changeAgeRange.bind(this),
    updateDuration:this.updateDuration.bind(this),
    updateEndDate:this.updateEndDate.bind(this)
  }; 

  constructor(private fb:FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      ageGroup: [''],
      ageRange: [''],
      startDate: [''],
      endDate: [''],
      duration: ['']
    });
    this.buildForm(data);
    this.form.get('endDate')?.valueChanges.subscribe((value: any) =>{
      this.updateDuration();
    });
    this.form.get('duration')?.valueChanges.subscribe((value:any)=> {
      this.updateEndDate();
    })
  }

  buildForm(fields: any[]) {
    this.formFields = fields;
    for(const field of fields) {
      this.form.addControl(field.name, this.fb.control(field.defaultValue || '', Validators.required));
    }
  }

  handleCondition(field: any) {
    if(field.conditions && field.conditions.onChange) {
      const handlerName = field.conditions.onChange as keyof ConditionHandlers;
      const handler = this.conditionHandlers[handlerName];
      if(typeof handler === 'function') {
        handler(field);
      }
    }
  }

  changeAgeRange() {
    const ageGroup = this.form.get('ageGroup')?.value as AgeGroup;
    const ageGroupToRange: Record<AgeGroup, string> = {
      infant:'0-2',
      child: '3-12',
      teenager:'13-19',
      young_adult: '20-39',
      adult: '40-59',
      senior:'60+'
    };
    this.form.patchValue({ ageRange: ageGroupToRange[ageGroup] });
  }

  updateDuration() {
    const startDate = this.form.get('startDate')?.value;
    const endDate = this.form.get('endDate')?.value;

    if(startDate && endDate){
      const duration = differenceInDays(new Date(endDate), new Date(startDate));
      this.form.patchValue({ duration });

    }
  }

  updateEndDate() {
    const startDate = this.form.get('startDate')?.value;
    const duration = this.form.get('duration')?.value;

    if(startDate && duration){
      const endDate = addDays(new Date(startDate), duration);
      this.form.patchValue({endDate});

    }
  }
}
