import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectoryNodeComponent } from './directory-node.component';

describe('DirectoryNodeComponent', () => {
  let component: DirectoryNodeComponent;
  let fixture: ComponentFixture<DirectoryNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DirectoryNodeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DirectoryNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
