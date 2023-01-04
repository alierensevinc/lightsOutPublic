/* tslint:disable:radix */
import {Component} from '@angular/core';
import {Plugins} from '@capacitor/core';
import {LoadingController, ToastController} from '@ionic/angular';

const {Storage} = Plugins;

// noinspection JSIgnoredPromiseFromCall
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  lights = [
    {id: 1, isOn: false},
    {id: 2, isOn: false},
    {id: 3, isOn: false},
    {id: 4, isOn: false},
    {id: 5, isOn: false}];

  gameState = 0;
  lightInterval: any;
  playerInterval: any;
  playerScore = '0';
  moveCar = 0;
  highScore: any = 0;

  constructor(private toastController: ToastController,
              private loadingController: LoadingController) {
    this.getHighScore();
    this.presentToast('Click anywhere to turn on the lights. And click again when lights go off.', 4000, 'bottom');
  }

  async presentToast(m, d, p) {
    const toast = await this.toastController.create({
      animated: true,
      cssClass: 'lights-out-toast',
      duration: d,
      message: m,
      mode: 'ios',
      position: p,
    });
    await toast.present();
  }

  // noinspection JSUnusedGlobalSymbols
  ionViewDidEnter() {
    Plugins.App.addListener('backButton', Plugins.App.exitApp);
  }

  triggerGame() {
    if (this.gameState === 0) {
      this.gameState = 2;
      this.turnOnTheLights();
    } else if (this.gameState === 1) {
      this.startTheRace();
    }
  }

  turnOnTheLights() {
    this.playerScore = '0';
    let currentLight = 0;
    this.lightInterval = setInterval(() => {
      this.lights[currentLight].isOn = true;
      currentLight++;
      if (currentLight === 5) {
        clearInterval(this.lightInterval);
        this.turnOffTheLights();
      }
    }, 1000);
  }

  turnOffTheLights() {
    setTimeout(() => {
      for (const light of this.lights) {
        light.isOn = false;
      }
      this.gameState = 1;
      this.startTimer();
      this.moveCar = 1;
    }, Math.floor(Math.random() * 5000) + 1000);
  }

  startTimer() {
    let time = 0;
    this.playerInterval = setInterval(() => {
      time++;
      this.playerScore = (time).toString();
      if (this.playerScore.length < 3) {
        this.playerScore = '0.' + this.playerScore;
      } else if (this.playerScore.length > 2 && this.playerScore.length < 4) {
        this.playerScore = this.playerScore.substring(0, 1) + '.' + this.playerScore.substring(1);
      } else {
        this.playerScore = this.playerScore.substring(0, 2) + '.' + this.playerScore.substring(1, this.playerScore.length - 1);
      }
    }, 10);
  }

  stopTimer() {
    clearInterval(this.playerInterval);
  }

  startTheRace() {
    this.gameState = 0;
    this.moveCar = 0;
    if (parseFloat(this.playerScore) < parseFloat(this.highScore) || this.highScore === 0) {
      // noinspection JSIgnoredPromiseFromCall
      this.setHighScore(this.playerScore);
    }
    this.stopTimer();
  }

  async setHighScore(score) {
    const loading = await this.loadingController.create({
      message: 'Please wait...',
      mode: 'ios'
    });
    await loading.present();

    this.setItem('highScore', score).then(() => {
      this.highScore = score;
      loading.dismiss();
    }).catch((error) => {
      console.log(error);
      loading.dismiss();
    });
  }

  async getHighScore() {
    const loading = await this.loadingController.create({
      message: 'Please wait...',
      mode: 'ios',
    });
    await loading.present();

    this.getItem('highScore').then((value) => {
      if (value.value !== null) {
        this.highScore = parseFloat(value.value);
      } else {
        this.highScore = 0;
      }
      loading.dismiss();
    }).catch(() => {
      this.highScore = 0;
      loading.dismiss();
    });
  }

  async setItem(pKey, pValue) {
    await Storage.set({
      key: pKey,
      value: pValue
    });
  }

  async getItem(pKey) {
    return await Storage.get({key: pKey});
  }
}
