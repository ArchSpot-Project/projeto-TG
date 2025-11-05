import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { projectAccessGuard } from './project-access.guard';

describe('projectAccessGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => projectAccessGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
