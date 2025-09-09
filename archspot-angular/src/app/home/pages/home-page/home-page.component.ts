import { Component, OnInit } from '@angular/core';
import { User } from '../../../core/models/user.model';
import { Router } from '@angular/router';

interface Project {
  id: number;
  title: string;
  imageUrl: string;
}

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent implements OnInit {

  users: User[] = [];
  myProjects: Project[] = [];
  sharedProjects: Project[] = [];
  recentProjects: Project[] = [];

  cardBorderColor: { [key: string]: string } = {
    'border-color': '#78A58B'
  };

  constructor(private router: Router) { };

  //TODO: Futuramente, buscar os projetos a partir do backend
  ngOnInit(): void {
    this.myProjects = [
      { id: 1, title: 'Projeto 01', imageUrl: '/assets/img/plano1.jpg' },
      { id: 2, title: 'Projeto 02', imageUrl: '/assets/img/plano2.jpg' },
      { id: 3, title: 'Projeto 03', imageUrl: '/assets/img/plano3.jpg' },
      { id: 4, title: 'Projeto 04', imageUrl: '/assets/img/plano1.jpg' },
      { id: 5, title: 'Projeto 05', imageUrl: '/assets/img/plano2.jpg' },
    ];

    this.sharedProjects = [
      { id: 6, title: 'Projeto 06', imageUrl: '/assets/img/plano1.jpg' },
      { id: 7, title: 'Projeto 07', imageUrl: '/assets/img/plano2.jpg' },
      { id: 8, title: 'Projeto 08', imageUrl: '/assets/img/plano3.jpg' },
    ];

    this.recentProjects = [
      { id: 9, title: 'Projeto 09', imageUrl: '/assets/img/plano1.jpg' },
      { id: 10, title: 'Projeto 10', imageUrl: '/assets/img/plano2.jpg' },
      { id: 11, title: 'Projeto 11', imageUrl: '/assets/img/plano3.jpg' },
    ];
  }

  goToProjects(projectId: number): void {
    this.router.navigate(['/projects', projectId]);
  }
}
