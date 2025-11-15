import { CommonModule } from '@angular/common';
import { Component, ElementRef, QueryList, ViewChildren, ChangeDetectorRef } from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { SafeHtmlPipe } from '../../pipe/safe-html.pipe';
import { combineLatest, Subscription } from 'rxjs';

type NavItem = {
  name: string;
  icon: string;
  path?: string;
  new?: boolean;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

@Component({
  selector: 'app-sidebar',
  imports: [
    CommonModule,
    RouterModule,
    SafeHtmlPipe
  ],
  templateUrl: './app-sidebar.component.html',
})
export class AppSidebarComponent {

  // Main nav items - RBAC System
  navItems: NavItem[] = [
    {
      icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.5 3.25C4.25736 3.25 3.25 4.25736 3.25 5.5V8.99998C3.25 10.2426 4.25736 11.25 5.5 11.25H9C10.2426 11.25 11.25 10.2426 11.25 8.99998V5.5C11.25 4.25736 10.2426 3.25 9 3.25H5.5ZM4.75 5.5C4.75 5.08579 5.08579 4.75 5.5 4.75H9C9.41421 4.75 9.75 5.08579 9.75 5.5V8.99998C9.75 9.41419 9.41421 9.74998 9 9.74998H5.5C5.08579 9.74998 4.75 9.41419 4.75 8.99998V5.5ZM5.5 12.75C4.25736 12.75 3.25 13.7574 3.25 15V18.5C3.25 19.7426 4.25736 20.75 5.5 20.75H9C10.2426 20.75 11.25 19.7427 11.25 18.5V15C11.25 13.7574 10.2426 12.75 9 12.75H5.5ZM4.75 15C4.75 14.5858 5.08579 14.25 5.5 14.25H9C9.41421 14.25 9.75 14.5858 9.75 15V18.5C9.75 18.9142 9.41421 19.25 9 19.25H5.5C5.08579 19.25 4.75 18.9142 4.75 18.5V15ZM12.75 5.5C12.75 4.25736 13.7574 3.25 15 3.25H18.5C19.7426 3.25 20.75 4.25736 20.75 5.5V8.99998C20.75 10.2426 19.7426 11.25 18.5 11.25H15C13.7574 11.25 12.75 10.2426 12.75 8.99998V5.5ZM15 4.75C14.5858 4.75 14.25 5.08579 14.25 5.5V8.99998C14.25 9.41419 14.5858 9.74998 15 9.74998H18.5C18.9142 9.74998 19.25 9.41419 19.25 8.99998V5.5C19.25 5.08579 18.9142 4.75 18.5 4.75H15ZM15 12.75C13.7574 12.75 12.75 13.7574 12.75 15V18.5C12.75 19.7426 13.7574 20.75 15 20.75H18.5C19.7426 20.75 20.75 19.7427 20.75 18.5V15C20.75 13.7574 19.7426 12.75 18.5 12.75H15ZM14.25 15C14.25 14.5858 14.5858 14.25 15 14.25H18.5C18.9142 14.25 19.25 14.5858 19.25 15V18.5C19.25 18.9142 18.9142 19.25 18.5 19.25H15C14.5858 19.25 14.25 18.9142 14.25 18.5V15Z" fill="currentColor"></path></svg>`,
      name: "Dashboard",
      path: "/",
    },
    {
      icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.5 3.25C4.25736 3.25 3.25 4.25736 3.25 5.5V18.5C3.25 19.7426 4.25736 20.75 5.5 20.75H18.5001C19.7427 20.75 20.7501 19.7426 20.7501 18.5V5.5C20.7501 4.25736 19.7427 3.25 18.5001 3.25H5.5ZM4.75 5.5C4.75 5.08579 5.08579 4.75 5.5 4.75H18.5001C18.9143 4.75 19.2501 5.08579 19.2501 5.5V18.5C19.2501 18.9142 18.9143 19.25 18.5001 19.25H5.5C5.08579 19.25 4.75 18.9142 4.75 18.5V5.5ZM6.25005 9.7143C6.25005 9.30008 6.58583 8.9643 7.00005 8.9643L17 8.96429C17.4143 8.96429 17.75 9.30008 17.75 9.71429C17.75 10.1285 17.4143 10.4643 17 10.4643L7.00005 10.4643C6.58583 10.4643 6.25005 10.1285 6.25005 9.7143ZM6.25005 14.2857C6.25005 13.8715 6.58583 13.5357 7.00005 13.5357H17C17.4143 13.5357 17.75 13.8715 17.75 14.2857C17.75 14.6999 17.4143 15.0357 17 15.0357H7.00005C6.58583 15.0357 6.25005 14.6999 6.25005 14.2857Z" fill="currentColor"></path></svg>`,
      name: "Modules",
      path: "/modules",
    },
    {
      icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 14.1526 4.3002 16.1184 5.61936 17.616C6.17279 15.3096 8.24852 13.5955 10.7246 13.5955H13.2746C15.7509 13.5955 17.8268 15.31 18.38 17.6167C19.6996 16.119 20.5 14.153 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5ZM17.0246 18.8566V18.8455C17.0246 16.7744 15.3457 15.0955 13.2746 15.0955H10.7246C8.65354 15.0955 6.97461 16.7744 6.97461 18.8455V18.856C8.38223 19.8895 10.1198 20.5 12 20.5C13.8798 20.5 15.6171 19.8898 17.0246 18.8566ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM11.9991 7.25C10.8847 7.25 9.98126 8.15342 9.98126 9.26784C9.98126 10.3823 10.8847 11.2857 11.9991 11.2857C13.1135 11.2857 14.0169 10.3823 14.0169 9.26784C14.0169 8.15342 13.1135 7.25 11.9991 7.25ZM8.48126 9.26784C8.48126 7.32499 10.0563 5.75 11.9991 5.75C13.9419 5.75 15.5169 7.32499 15.5169 9.26784C15.5169 11.2107 13.9419 12.7857 11.9991 12.7857C10.0563 12.7857 8.48126 11.2107 8.48126 9.26784Z" fill="currentColor"></path></svg>`,
      name: "Profiles",
      path: "/profiles",
    },
    // {
    //   icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 14.1526 4.3002 16.1184 5.61936 17.616C6.17279 15.3096 8.24852 13.5955 10.7246 13.5955H13.2746C15.7509 13.5955 17.8268 15.31 18.38 17.6167C19.6996 16.119 20.5 14.153 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5ZM17.0246 18.8566V18.8455C17.0246 16.7744 15.3457 15.0955 13.2746 15.0955H10.7246C8.65354 15.0955 6.97461 16.7744 6.97461 18.8455V18.856C8.38223 19.8895 10.1198 20.5 12 20.5C13.8798 20.5 15.6171 19.8898 17.0246 18.8566ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM11.9991 7.25C10.8847 7.25 9.98126 8.15342 9.98126 9.26784C9.98126 10.3823 10.8847 11.2857 11.9991 11.2857C13.1135 11.2857 14.0169 10.3823 14.0169 9.26784C14.0169 8.15342 13.1135 7.25 11.9991 7.25ZM8.48126 9.26784C8.48126 7.32499 10.0563 5.75 11.9991 5.75C13.9419 5.75 15.5169 7.32499 15.5169 9.26784C15.5169 11.2107 13.9419 12.7857 11.9991 12.7857C10.0563 12.7857 8.48126 11.2107 8.48126 9.26784Z" fill="currentColor"></path></svg>`,
    //   name: "Profile",
    //   path: "/profile",
    // },
    {
      icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.25 5.5C3.25 4.25736 4.25736 3.25 5.5 3.25H18.5C19.7426 3.25 20.75 4.25736 20.75 5.5V18.5C20.75 19.7426 19.7426 20.75 18.5 20.75H5.5C4.25736 20.75 3.25 19.7426 3.25 18.5V5.5ZM5.5 4.75C5.08579 4.75 4.75 5.08579 4.75 5.5V8.58325L19.25 8.58325V5.5C19.25 5.08579 18.9142 4.75 18.5 4.75H5.5ZM19.25 10.0833H15.416V13.9165H19.25V10.0833ZM13.916 10.0833L10.083 10.0833V13.9165L13.916 13.9165V10.0833ZM8.58301 10.0833H4.75V13.9165H8.58301V10.0833ZM4.75 18.5V15.4165H8.58301V19.25H5.5C5.08579 19.25 4.75 18.9142 4.75 18.5ZM10.083 19.25V15.4165L13.916 15.4165V19.25H10.083ZM15.416 19.25V15.4165H19.25V18.5C19.25 18.9142 18.9142 19.25 18.5 19.25H15.416Z" fill="currentColor"></path></svg>`,
      name: "Entities",
      path: "/entities",
    },
    {
      icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C11.5858 2 11.25 2.33579 11.25 2.75V12C11.25 12.4142 11.5858 12.75 12 12.75H21.25C21.6642 12.75 22 12.4142 22 12C22 6.47715 17.5228 2 12 2ZM12.75 11.25V3.53263C13.2645 3.57761 13.7659 3.66843 14.25 3.80098V3.80099C15.6929 4.19606 16.9827 4.96184 18.0104 5.98959C19.0382 7.01734 19.8039 8.30707 20.199 9.75C20.3316 10.2341 20.4224 10.7355 20.4674 11.25H12.75ZM2 12C2 7.25083 5.31065 3.27489 9.75 2.25415V3.80099C6.14748 4.78734 3.5 8.0845 3.5 12C3.5 16.6944 7.30558 20.5 12 20.5C15.9155 20.5 19.2127 17.8525 20.199 14.25H21.7459C20.7251 18.6894 16.7492 22 12 22C6.47715 22 2 17.5229 2 12Z" fill="currentColor"></path></svg>`,
      name: "Roles",
      path: "/roles",
    },
    {
      icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.80443 5.60156C7.59109 5.60156 6.60749 6.58517 6.60749 7.79851C6.60749 9.01185 7.59109 9.99545 8.80443 9.99545C10.0178 9.99545 11.0014 9.01185 11.0014 7.79851C11.0014 6.58517 10.0178 5.60156 8.80443 5.60156ZM5.10749 7.79851C5.10749 5.75674 6.76267 4.10156 8.80443 4.10156C10.8462 4.10156 12.5014 5.75674 12.5014 7.79851C12.5014 9.84027 10.8462 11.4955 8.80443 11.4955C6.76267 11.4955 5.10749 9.84027 5.10749 7.79851ZM4.86252 15.3208C4.08769 16.0881 3.70377 17.0608 3.51705 17.8611C3.48384 18.0034 3.5211 18.1175 3.60712 18.2112C3.70161 18.3141 3.86659 18.3987 4.07591 18.3987H13.4249C13.6343 18.3987 13.7992 18.3141 13.8937 18.2112C13.9797 18.1175 14.017 18.0034 13.9838 17.8611C13.7971 17.0608 13.4132 16.0881 12.6383 15.3208C11.8821 14.572 10.6899 13.955 8.75042 13.955C6.81096 13.955 5.61877 14.572 4.86252 15.3208ZM3.8071 14.2549C4.87163 13.2009 6.45602 12.455 8.75042 12.455C11.0448 12.455 12.6292 13.2009 13.6937 14.2549C14.7397 15.2906 15.2207 16.5607 15.4446 17.5202C15.7658 18.8971 14.6071 19.8987 13.4249 19.8987H4.07591C2.89369 19.8987 1.73504 18.8971 2.05628 17.5202C2.28015 16.5607 2.76117 15.2906 3.8071 14.2549ZM15.3042 11.4955C14.4702 11.4955 13.7006 11.2193 13.0821 10.7533C13.3742 10.3314 13.6054 9.86419 13.7632 9.36432C14.1597 9.75463 14.7039 9.99545 15.3042 9.99545C16.5176 9.99545 17.5012 9.01185 17.5012 7.79851C17.5012 6.58517 16.5176 5.60156 15.3042 5.60156C14.7039 5.60156 14.1597 5.84239 13.7632 6.23271C13.6054 5.73284 13.3741 5.26561 13.082 4.84371C13.7006 4.37777 14.4702 4.10156 15.3042 4.10156C17.346 4.10156 19.0012 5.75674 19.0012 7.79851C19.0012 9.84027 17.346 11.4955 15.3042 11.4955ZM19.9248 19.8987H16.3901C16.7014 19.4736 16.9159 18.969 16.9827 18.3987H19.9248C20.1341 18.3987 20.2991 18.3141 20.3936 18.2112C20.4796 18.1175 20.5169 18.0034 20.4837 17.861C20.2969 17.0607 19.913 16.088 19.1382 15.3208C18.4047 14.5945 17.261 13.9921 15.4231 13.9566C15.2232 13.6945 14.9995 13.437 14.7491 13.1891C14.5144 12.9566 14.262 12.7384 13.9916 12.5362C14.3853 12.4831 14.8044 12.4549 15.2503 12.4549C17.5447 12.4549 19.1291 13.2008 20.1936 14.2549C21.2395 15.2906 21.7206 16.5607 21.9444 17.5202C22.2657 18.8971 21.107 19.8987 19.9248 19.8987Z" fill="currentColor"></path></svg>`,
      name: "Users",
      path: "/user",
    },
    {
      icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M11.665 3.75621C11.8762 3.65064 12.1247 3.65064 12.3358 3.75621L18.7807 6.97856L12.3358 10.2009C12.1247 10.3065 11.8762 10.3065 11.665 10.2009L5.22014 6.97856L11.665 3.75621ZM4.29297 8.19203V16.0946C4.29297 16.3787 4.45347 16.6384 4.70757 16.7654L11.25 20.0366V11.6513C11.1631 11.6205 11.0777 11.5843 10.9942 11.5426L4.29297 8.19203ZM12.75 20.037L19.2933 16.7654C19.5474 16.6384 19.7079 16.3787 19.7079 16.0946V8.19202L13.0066 11.5426C12.9229 11.5844 12.8372 11.6208 12.75 11.6516V20.037ZM13.0066 2.41456C12.3732 2.09786 11.6277 2.09786 10.9942 2.41456L4.03676 5.89319C3.27449 6.27432 2.79297 7.05342 2.79297 7.90566V16.0946C2.79297 16.9469 3.27448 17.726 4.03676 18.1071L10.9942 21.5857L11.3296 20.9149L10.9942 21.5857C11.6277 21.9024 12.3732 21.9024 13.0066 21.5857L19.9641 18.1071C20.7264 17.726 21.2079 16.9469 21.2079 16.0946V7.90566C21.2079 7.05342 20.7264 6.27432 19.9641 5.89319L13.0066 2.41456Z" fill="currentColor"></path></svg>`,
      name: "Meters",
      path: "/meter",
    },
  ];
  
  // Others nav items - Commented out for RBAC System
  othersItems: NavItem[] = [
    // {
    //   icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C11.5858 2 11.25 2.33579 11.25 2.75V12C11.25 12.4142 11.5858 12.75 12 12.75H21.25C21.6642 12.75 22 12.4142 22 12C22 6.47715 17.5228 2 12 2ZM12.75 11.25V3.53263C13.2645 3.57761 13.7659 3.66843 14.25 3.80098V3.80099C15.6929 4.19606 16.9827 4.96184 18.0104 5.98959C19.0382 7.01734 19.8039 8.30707 20.199 9.75C20.3316 10.2341 20.4224 10.7355 20.4674 11.25H12.75ZM2 12C2 7.25083 5.31065 3.27489 9.75 2.25415V3.80099C6.14748 4.78734 3.5 8.0845 3.5 12C3.5 16.6944 7.30558 20.5 12 20.5C15.9155 20.5 19.2127 17.8525 20.199 14.25H21.7459C20.7251 18.6894 16.7492 22 12 22C6.47715 22 2 17.5229 2 12Z" fill="currentColor"></path></svg>`,
    //   name: "Charts",
    //   subItems: [
    //     { name: "Line Chart", path: "/line-chart", pro: false },
    //     { name: "Bar Chart", path: "/bar-chart", pro: false },
    //   ],
    // },
    // {
    //   icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M11.665 3.75618C11.8762 3.65061 12.1247 3.65061 12.3358 3.75618L18.7807 6.97853L12.3358 10.2009C12.1247 10.3064 11.8762 10.3064 11.665 10.2009L5.22014 6.97853L11.665 3.75618ZM4.29297 8.19199V16.0946C4.29297 16.3787 4.45347 16.6384 4.70757 16.7654L11.25 20.0365V11.6512C11.1631 11.6205 11.0777 11.5843 10.9942 11.5425L4.29297 8.19199ZM12.75 20.037L19.2933 16.7654C19.5474 16.6384 19.7079 16.3787 19.7079 16.0946V8.19199L13.0066 11.5425C12.9229 11.5844 12.8372 11.6207 12.75 11.6515V20.037ZM13.0066 2.41453C12.3732 2.09783 11.6277 2.09783 10.9942 2.41453L4.03676 5.89316C3.27449 6.27429 2.79297 7.05339 2.79297 7.90563V16.0946C2.79297 16.9468 3.27448 17.7259 4.03676 18.1071L10.9942 21.5857L11.3296 20.9149L10.9942 21.5857C11.6277 21.9024 12.3732 21.9024 13.0066 21.5857L19.9641 18.1071C20.7264 17.7259 21.2079 16.9468 21.2079 16.0946V7.90563C21.2079 7.05339 20.7264 6.27429 19.9641 5.89316L13.0066 2.41453Z" fill="currentColor"></path></svg>`,
    //   name: "UI Elements",
    //   subItems: [
    //     { name: "Alerts", path: "/alerts", pro: false },
    //     { name: "Avatar", path: "/avatars", pro: false },
    //     { name: "Badge", path: "/badge", pro: false },
    //     { name: "Buttons", path: "/buttons", pro: false },
    //     { name: "Images", path: "/images", pro: false },
    //     { name: "Videos", path: "/videos", pro: false },
    //   ],
    // },
    // {
    //   icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M14 2.75C14 2.33579 14.3358 2 14.75 2C15.1642 2 15.5 2.33579 15.5 2.75V5.73291L17.75 5.73291H19C19.4142 5.73291 19.75 6.0687 19.75 6.48291C19.75 6.89712 19.4142 7.23291 19 7.23291H18.5L18.5 12.2329C18.5 15.5691 15.9866 18.3183 12.75 18.6901V21.25C12.75 21.6642 12.4142 22 12 22C11.5858 22 11.25 21.6642 11.25 21.25V18.6901C8.01342 18.3183 5.5 15.5691 5.5 12.2329L5.5 7.23291H5C4.58579 7.23291 4.25 6.89712 4.25 6.48291C4.25 6.0687 4.58579 5.73291 5 5.73291L6.25 5.73291L8.5 5.73291L8.5 2.75C8.5 2.33579 8.83579 2 9.25 2C9.66421 2 10 2.33579 10 2.75L10 5.73291L14 5.73291V2.75ZM7 7.23291L7 12.2329C7 14.9943 9.23858 17.2329 12 17.2329C14.7614 17.2329 17 14.9943 17 12.2329L17 7.23291L7 7.23291Z" fill="currentColor"></path></svg>`,
    //   name: "Authentication",
    //   subItems: [
    //     { name: "Sign In", path: "/signin", pro: false },
    //     { name: "Sign Up", path: "/signup", pro: false },
    //   ],
    // },
  ];

  openSubmenu: string | null | number = null;
  subMenuHeights: { [key: string]: number } = {};
  @ViewChildren('subMenu') subMenuRefs!: QueryList<ElementRef>;

  readonly isExpanded$;
  readonly isMobileOpen$;
  readonly isHovered$;

  private subscription: Subscription = new Subscription();

  constructor(
    public sidebarService: SidebarService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.isExpanded$ = this.sidebarService.isExpanded$;
    this.isMobileOpen$ = this.sidebarService.isMobileOpen$;
    this.isHovered$ = this.sidebarService.isHovered$;
  }

  ngOnInit() {
    // Subscribe to router events
    this.subscription.add(
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.setActiveMenuFromRoute(this.router.url);
        }
      })
    );

    // Subscribe to combined observables to close submenus when all are false
    this.subscription.add(
      combineLatest([this.isExpanded$, this.isMobileOpen$, this.isHovered$]).subscribe(
        ([isExpanded, isMobileOpen, isHovered]) => {
          if (!isExpanded && !isMobileOpen && !isHovered) {
            // this.openSubmenu = null;
            // this.savedSubMenuHeights = { ...this.subMenuHeights };
            // this.subMenuHeights = {};
            this.cdr.detectChanges();
          } else {
            // Restore saved heights when reopening
            // this.subMenuHeights = { ...this.savedSubMenuHeights };
            // this.cdr.detectChanges();
          }
        }
      )
    );

    // Initial load
    this.setActiveMenuFromRoute(this.router.url);
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscription.unsubscribe();
  }

  isActive(path: string): boolean {
    return this.router.url === path;
  }

  toggleSubmenu(section: string, index: number) {
    const key = `${section}-${index}`;

    if (this.openSubmenu === key) {
      this.openSubmenu = null;
      this.subMenuHeights[key] = 0;
    } else {
      this.openSubmenu = key;

      setTimeout(() => {
        const el = document.getElementById(key);
        if (el) {
          this.subMenuHeights[key] = el.scrollHeight;
          this.cdr.detectChanges(); // Ensure UI updates
        }
      });
    }
  }

  onSidebarMouseEnter() {
    this.isExpanded$.subscribe(expanded => {
      if (!expanded) {
        this.sidebarService.setHovered(true);
      }
    }).unsubscribe();
  }

  private setActiveMenuFromRoute(currentUrl: string) {
    const menuGroups = [
      { items: this.navItems, prefix: 'main' },
      { items: this.othersItems, prefix: 'others' },
    ];

    menuGroups.forEach(group => {
      group.items.forEach((nav, i) => {
        if (nav.subItems) {
          nav.subItems.forEach(subItem => {
            if (currentUrl === subItem.path) {
              const key = `${group.prefix}-${i}`;
              this.openSubmenu = key;

              setTimeout(() => {
                const el = document.getElementById(key);
                if (el) {
                  this.subMenuHeights[key] = el.scrollHeight;
                  this.cdr.detectChanges(); // Ensure UI updates
                }
              });
            }
          });
        }
      });
    });
  }

  onSubmenuClick() {
    console.log('click submenu');
    this.isMobileOpen$.subscribe(isMobile => {
      if (isMobile) {
        this.sidebarService.setMobileOpen(false);
      }
    }).unsubscribe();
  }  

  
}
