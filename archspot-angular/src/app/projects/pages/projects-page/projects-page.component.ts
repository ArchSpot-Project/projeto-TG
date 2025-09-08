import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface Project {
  id: number;
  title: string;
  imageUrl: string;
  description?: string;
  borderColor?: string;
  buttonStyle?: string;
}

@Component({
  selector: 'app-projects-page',
  templateUrl: './projects-page.component.html',
  styleUrls: ['./projects-page.component.css']
})
export class ProjectsPageComponent {
  openProjects: Project[] = [];
  closedProjects: Project[] = [];

  constructor(private router: Router) {}

  //TODO: Futuramente, buscar a situação do projeto (aberto ou fechado) a partir do backend para mudar a lógica de exibição
  ngOnInit(): void {
    this.openProjects = [
      { id: 1, title: 'Projeto 01', imageUrl: '/assets/img/plano1.jpg', description: 'Lorem ipsum dolor sit amet...', buttonStyle: 'success' },
      { id: 2, title: 'Projeto 02', imageUrl: '/assets/img/plano2.jpg', description: 'Lorem ipsum dolor sit amet...', buttonStyle: 'success' },
      { id: 3, title: 'Projeto 03', imageUrl: '/assets/img/plano3.jpg', description: 'Lorem ipsum dolor sit amet...', buttonStyle: 'success' },
      { id: 4, title: 'Projeto 04', imageUrl: '/assets/img/plano1.jpg', description: 'Lorem ipsum dolor sit amet...', buttonStyle: 'success' },
      { id: 5, title: 'Projeto 05', imageUrl: '/assets/img/plano2.jpg', description: 'Lorem ipsum dolor sit amet...', buttonStyle: 'success' },
    ];

    this.closedProjects = [
      { id: 6, title: 'Projeto 06', imageUrl: '/assets/img/plano1.jpg', description: 'Lorem ipsum dolor sit amet...', buttonStyle: 'secondary' },
      { id: 7, title: 'Projeto 07', imageUrl: '/assets/img/plano2.jpg', description: 'Lorem ipsum dolor sit amet...', buttonStyle: 'secondary' },
      { id: 8, title: 'Projeto 08', imageUrl: '/assets/img/plano3.jpg', description: 'Lorem ipsum dolor sit amet...', buttonStyle: 'secondary' },
    ];
  }

  goToProjects(projectId: number): void {
    this.router.navigate(['/projects', projectId]);
  }
}
