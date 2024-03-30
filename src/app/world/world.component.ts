import { Component, OnInit, AfterViewInit, ElementRef, Renderer2, ViewChild, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CountryInfoService } from '../country-info.service';

@Component({
  selector: 'app-world',
  templateUrl: './world.component.html',
  styleUrls: ['./world.component.scss']
})
export class WorldComponent implements OnInit, AfterViewInit {
  public svgContent: SafeHtml = '';
  public selectedCountryInfo: any;

  @ViewChild('svgContainer', { static: false }) svgContainer!: ElementRef;

  validCountryCodes: string[] = [];

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private renderer: Renderer2,
    private countryInfoService: CountryInfoService,
    private zone: NgZone
  ) { }

  ngOnInit(): void {
    this.loadSvg();
    this.fetchAllCountryCodes();
  }

  ngAfterViewInit(): void {
  }

  loadSvg(): void {
    this.http.get('assets/BlankMap-World.svg', { responseType: 'text' })
      .subscribe(svgData => {
        this.svgContent = this.sanitizer.bypassSecurityTrustHtml(svgData);
        this.addClickListenersToSvgPaths();
      });
  }

  fetchAllCountryCodes(): void {
    this.countryInfoService.getAllCountries().subscribe(data => {
      if (data && data[1]) {
        this.validCountryCodes = data[1].map((country: any) => country.iso2Code);
      }
    });
  }

  addClickListenersToSvgPaths(): void {
    setTimeout(() => {
      const svgElement = this.svgContainer.nativeElement.querySelector('svg');
      if (svgElement) {
        const groups = svgElement.querySelectorAll('g');
        groups.forEach((group: Element) => {
          const countryCode = group.id.toUpperCase();
          const paths = group.querySelectorAll('path');
          paths.forEach((path: Element) => {
            this.renderer.listen(path, 'click', (event: MouseEvent) => {
              this.onCountrySelect(countryCode, event);
            });
          });
        });
      }
    }, 0);
  }
  
  // addClickListenersToSvgPaths(): void {
  //   setTimeout(() => {
  //     const svgElement = this.svgContainer.nativeElement.querySelector('svg');
  //     if (svgElement) {
  //       const elements = svgElement.querySelectorAll('path, circle, polygon'); // Add more selectors as needed
  //       elements.forEach((element: Element) => {
  //         const countryCode = this.extractCountryCode(element); // Implement this method
  //         this.renderer.listen(element, 'click', (event: MouseEvent) => {
  //           if (countryCode) {
  //             this.onCountrySelect(countryCode, event);
  //           }
  //         });
  //       });
  //     }
  //   }, 0);
  // }
  
  extractCountryCode(element: Element): string | null {
    let currentElement: Element | null = element;
    while (currentElement && currentElement.nodeName.toLowerCase() !== 'svg') {
      const countryCode = currentElement.id.toUpperCase();
      if (this.isValidCountryCode(countryCode)) {
        return countryCode;
      }
      currentElement = currentElement.parentElement;
    }
    return null;
  }
  
  isValidCountryCode(countryCode: string): boolean {
    return this.validCountryCodes.includes(countryCode);
  }

  isHighIncomeWesternNation(countryId: string): boolean {
    const highIncomeWesternNations = ['USA', 'CAN', 'GBR', 'AUS', 'NZL', 'DEU', 'FRA', 'ITA', 'JPN', 'CHE', 'NLD', 'SWE', 'NOR', 'DNK', 'AUT', 'BEL', 'FIN', 'IRL', 'LUX'];
    return highIncomeWesternNations.includes(countryId);
  }

  onCountrySelect(countryCode: string, event: MouseEvent): void {
    if (!this.validCountryCodes.includes(countryCode)) {
      console.error(`Invalid country code: ${countryCode}`);
      return;
    }
  
    this.countryInfoService.getCountryInfo(countryCode).subscribe(data => {
      if (data && data.length > 1 && data[1].length > 0) {
        const countryData = data[1][0];
        this.zone.run(() => {
          const isDonorNation = this.isHighIncomeWesternNation(countryData.id) || countryData.lendingType.value === 'Not Available' || countryData.incomeLevel.value === 'High income';
  
          this.selectedCountryInfo = {
            name: countryData.name,
            capitalCity: countryData.capitalCity,
            region: countryData.region.value,
            incomeLevel: countryData.incomeLevel.value,
            longitude: countryData.longitude,
            latitude: countryData.latitude,
            lendingType: isDonorNation ? 'Donor Nation' : countryData.lendingType.value
          };
          console.log("Updated selectedCountryInfo:", this.selectedCountryInfo);
          this.positionDetailsBox(event);
        });
      } else {
        console.error('Country data not found for:', countryCode);
        this.selectedCountryInfo = null;
      }
    }, error => {
      console.error('Error fetching country info:', error);
      this.selectedCountryInfo = null;
    });
  }
  
  positionDetailsBox(event: MouseEvent): void {
    const detailsBox = document.getElementById('countryDetails');
    if (detailsBox) {
      const svgRect = this.svgContainer.nativeElement.getBoundingClientRect();
      const offsetX = event.clientX - svgRect.left;
      const offsetY = event.clientY - svgRect.top;
      detailsBox.style.position = 'absolute';
      detailsBox.style.left = `${offsetX + 100}px`;
      detailsBox.style.top = `${offsetY}px`;
    }
  }
}  
