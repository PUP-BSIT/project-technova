import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-student-contact-us',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './student-contact-us.html',
  styleUrls: ['./student-contact-us.scss']
})
export class StudentContactUs {
  contactForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';

  loading: boolean = false;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      message: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (!this.contactForm.valid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      this.successMessage = '';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const payload = this.contactForm.value;

    this.http.post<any>('/api/contact', payload).subscribe({
      next: (res) => {
        this.successMessage = res?.message || 'Message sent successfully!';
        this.errorMessage = '';
        this.contactForm.reset();
        setTimeout(() => this.successMessage = '', 3000);
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to send message. Please try again later.';
        this.successMessage = '';
        this.loading = false;
      }
    });
  }
}