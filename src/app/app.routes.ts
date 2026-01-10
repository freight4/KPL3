import { Routes } from '@angular/router';
import { DraftComponent } from './Draft/draft.component';
import { FreeAgentsComponent } from './Free_Agency/free-agents.component';
import { TeamBuilderComponent } from './Team_Builder/team-builder.component';
import { ScheduleBuilderComponent } from './Schedule_Builder/schedule_builder.component';

export const routes: Routes = [
  { path: 'draft', component: DraftComponent },
  { path: 'free-agents', component: FreeAgentsComponent },
  { path: 'team-builder', component: TeamBuilderComponent },
  { path: 'schedule_builder', component: ScheduleBuilderComponent },
  { path: '', redirectTo: 'draft', pathMatch: 'full' }
];
