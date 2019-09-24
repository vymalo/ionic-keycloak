/*
 * Copyright (c) 2019. This Code is under license and belongs to Coding Motion
 */

import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {filter} from 'rxjs/operators';
import {DeeplinkMatch, Deeplinks} from '@ionic-native/deeplinks/ngx';
import {KeyValueStr} from '../model';
import {NavController} from '@ionic/angular';

@Injectable()
export class DeepLinkService {

  private paramsSubject = new Subject<string>();

  constructor(private navController: NavController,
              private deepLinks: Deeplinks) {
  }

  params() {
    return this.paramsSubject
      .pipe(filter(str => !!str));
  }

  init() {
    this.deepLinks
      .route({})
      .subscribe(
        (match: DeeplinkMatch) => {
          // match.$route - the route we matched, which is the matched entry from the arguments to route()
          // match.$args - the args passed in the link
          // match.$link - the full link data
          this.extractData(match.$link);
        },
        nomatch => {
          // nomatch.$link - the full link data
          this.extractData(nomatch.$link);
        }
      );
  }

  private extractData($link) {
    if ($link) {
      const {path, fragment, host, scheme, url} = $link;
      if (this.containsCode(fragment)) {
        const extractCode = this.extractCode(fragment);
        this.nextParams(extractCode.code);
      }
    }
  }

  private extractCode(url: string) {
    const hashes = url.slice(url.indexOf('?') + 1).split('&');
    const paramsObj = hashes.reduce((params, hash) => {
      const [key, val] = hash.split('=');
      return Object.assign(params, {[key]: decodeURIComponent(val)});
    }, {} as KeyValueStr);
    if ((!paramsObj) || (!paramsObj.code)) {
      return;
    }
    paramsObj.code = (paramsObj.code as string).split('#')[0];
    return paramsObj;
  }

  private nextParams(code: string) {
    this.paramsSubject.next(code);
  }

  private containsCode(fragment: string) {
    if (!fragment) {
      return false;
    }
    return fragment.indexOf('code') > -1;
  }
}
