import { Component, OnInit } from '@angular/core';
import { KpiService } from './kpi.service';

@Component({
  selector: 'app-kpi',
  templateUrl: './kpi.component.html',
  styleUrls: ['./kpi.component.css']
})
export class KpiComponent implements OnInit {
  kpis: any[] = [];

  constructor(private kpiService: KpiService) { }

  ngOnInit(): void {
    this.kpiService.getKpis().subscribe(data => {
      this.kpis = data.map(kpi => {
        const prev = kpi.previousValue;
        return {
          ...kpi,
          trend: kpi.value > prev ? 'increasing'
               : kpi.value < prev ? 'decreasing'
               : 'stable',
        };
      });
    });
  }
}