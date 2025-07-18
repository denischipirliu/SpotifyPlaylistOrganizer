import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class Sidebar {
  private expandedSubject = new BehaviorSubject<boolean>(true);
  expanded$ = this.expandedSubject.asObservable();

  setExpanded(value: boolean) {
    this.expandedSubject.next(value);
  }

  toggle() {
    this.expandedSubject.next(!this.expandedSubject.value);
  }
}
