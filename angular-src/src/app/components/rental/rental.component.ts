import { Component, OnInit } from '@angular/core';
import { FlashMessagesService } from 'angular2-flash-messages';
import { CustomerService } from '../../services/customer.service';
import { RentalService } from '../../services/rental.service';
import { BikeService } from '../../services/bike.service';
import { Bike } from '../../shared/bike';

@Component({
  selector: 'app-rental',
  templateUrl: './rental.component.html',
  styleUrls: ['./rental.component.css']
})
export class RentalComponent implements OnInit {
	rentals: Object;
  rentalId: String;
  rentalDate: Date;
  rentalTotal: Number;
  rentalDuration: Number;
  subTotal: Number = 0;
  editDate: Date;
  rentalBikes: Number[];
  inBikes: Bike[] = [];
  outBikes: Bike[] = [];
  selectedBikes: Bike[] = [];
  custId: String;
  custName: String;
  custInfo: String;
  currentTime: Date;

  constructor(
    private customerService: CustomerService,
    private bikeService: BikeService,
  	private rentalService: RentalService,
  	private flashMessage: FlashMessagesService) { }

  ngOnInit() {
  	this.rentalService.getRentalList().subscribe(data => {
  		this.rentals = data.msg;
  	}, err => {
  		console.log(err);
  		return false;
  	});
  }

  getCustId() {
    let query = {
      name: this.custName.toUpperCase(),
      info: this.custInfo
    }

    this.customerService.getCustId(query).subscribe(data => {
      if (data.success) {
        this.startRental(data.msg);
      } else {
        this.flashMessage.show(data.msg, {cssClass: 'alert-danger'});
      }
    }, err => {
      console.log(err);
      return false;
    }); 
  }

  startRental(cust) {
    let start = {
      customerId: cust._id,
      customerName: cust.name
    }
    this.rentalService.startRental(start).subscribe(data => {
      if (data.success) {
        console.log(data);
        this.flashMessage.show("Rental created for: " + this.custName.toUpperCase(), {cssClass: 'alert-success'});
        this.ngOnInit();
      } else {
        this.flashMessage.show(data.msg, {cssClass: 'alert-danger'});
      }
    }, err => {
      console.log(err);
      return false;
    }); 
  }

  onDelRental(rental) {
    let del = {
      customerId: rental.customerId,
      rentalId: rental._id,
      bikeId: rental.bikeId
    }
    this.rentalService.delRental(del).subscribe(data => {
      if (data.success) {
        this.flashMessage.show("Rental " + rental._id + " deleted", {cssClass: 'alert-success'});
        this.ngOnInit();
      } else {
        this.flashMessage.show(data.msg, {cssClass: 'alert-danger'});
        this.ngOnInit();
      }
    }, err => {
      console.log(err);
      return false;
    }); 
  }

  onAddBike(rental) {
    this.clearSelectedBikes();
    this.custId = rental.customerId;
    this.rentalId = rental._id;
    this.rentalDate = new Date(rental.date);
    this.rentalBikes = rental.bikeId;

    this.bikeService.bikeByStatus({status: "in"}).subscribe(data => {
      if (data.success) {
        this.inBikes = data.msg;
      } else {
        this.flashMessage.show(data.msg, {cssClass: 'alert-danger'});
      }
    }, err => {
      console.log(err);
      return false;
    });
  }

  onAddBikeSubmit() {
    let add = {
      rentalId: this.rentalId,
      bikes: this.selectedBikes
    }
    console.log(add);
    this.rentalService.addBike(add).subscribe(data => {
      if (data.success) {
        this.flashMessage.show(data.msg, {cssClass: 'alert-success'});
        this.ngOnInit();
      } else {
        this.flashMessage.show(data.msg, {cssClass: 'alert-danger'});
      }
    }, err => {
      console.log(err);
      return false;
    }); 
  }

  onDelBike(rental) {
    this.clearSelectedBikes();
    this.custId = rental.customerId;
    this.rentalId = rental._id;
    this.rentalDate = new Date(rental.date);
    this.rentalBikes = rental.bikeId;

    let rented = {
      status: this.rentalId
    }

    this.bikeService.bikeByStatus(rented).subscribe(data => {
      if (data.success) {
        this.outBikes = data.msg;
      } else {
        this.flashMessage.show(data.msg, {cssClass: 'alert-danger'});
      }
    }, err => {
      console.log(err);
      return false;
    });
  }

  onDelBikeSubmit() {
    let del = {
      rentalId: this.rentalId,
      bikes: this.selectedBikes
    }
    console.log(del);
    this.rentalService.removeBike(del).subscribe(data => {
      if (data.success) {
        this.flashMessage.show(data.msg, {cssClass: 'alert-success'});
        this.ngOnInit();
      } else {
        this.flashMessage.show(data.msg, {cssClass: 'alert-danger'});
      }
    }, err => {
      console.log(err);
      return false;
    }); 
  }

  onRetBike(rental) {
    this.clearSelectedBikes();
    this.subTotal = 0;
    this.rentalTotal = rental.total;
    this.custId = rental.customerId;
    this.custName = rental.customerName;
    this.rentalId = rental._id;
    this.rentalDate = new Date(rental.date);
    this.rentalBikes = rental.bikeId;

    let rented = {
      status: this.rentalId
    }

    this.bikeService.bikeByStatus(rented).subscribe(data => {
      if (data.success) {
        this.outBikes = data.msg;
      } else {
        this.flashMessage.show(data.msg, {cssClass: 'alert-danger'});
      }
    }, err => {
      console.log(err);
      return false;
    });
  }

  onRetBikeSubmit() {
    this.rentalTotal = Math.round((this.subTotal.valueOf() + this.rentalTotal.valueOf())*100)/100;
    console.log(this.rentalId);
    console.log(this.currentTime);
    console.log(this.selectedBikes);
    console.log(this.rentalTotal);
    console.log(this.rentalDuration);

    let ret = {
      rentalId: this.rentalId,
      endDate: this.currentTime,
      duration: this.rentalDuration,
      rentalStatus: (this.selectedBikes.length !== this.outBikes.length),
      total: this.rentalTotal,
      bikes: this.selectedBikes
    }

    this.rentalService.returnRental(ret).subscribe(data => {
      if (data.success) {
        this.ngOnInit();
      } else {
        this.flashMessage.show(data.msg, {cssClass: 'alert-danger'});
      }
    }, err => {
      console.log(err);
      return false;
    });
  }

  calcPrice(bikes) {
    this.currentTime = new Date;
    let duration = Math.round((this.currentTime.getTime() - this.rentalDate.getTime())/(1000*60));

    let total = 0;
    
    for (let bike = 0; bike < bikes.length; bike++) {
      let cost = Math.round((duration * (bikes[bike].price/60))*100)/100;
      total += cost;
    }

    this.subTotal = Math.round(total*100)/100;
    this.rentalDuration = duration;
  }

  onEditRental(rental) {
    this.custId = rental.customerId;
    this.rentalId = rental._id;
    this.rentalDate = new Date(rental.date);
    this.rentalBikes = rental.bikeId;
    this.editDate = new Date(rental.date);
  }

  resetEdit() {
    this.editDate = this.rentalDate;
    document.getElementById("rentalDate").nodeValue = this.rentalDate.toLocaleString();
  }

  onEditSubmit() {
    let edit = {
      rentalId: this.rentalId,
      date: new Date(this.editDate).toISOString()
    }

    console.log(edit);
    this.rentalService.changeDate(edit).subscribe(data => {
      if (data.success) {
        this.flashMessage.show(data.msg, {cssClass: 'alert-success'});
        this.ngOnInit();
      } else {
        this.flashMessage.show(data.msg, {cssClass: 'alert-danger'});
      }
    }, err => {
      console.log(err);
      return false;
    }); 
  }

  updateChecked(bike) {
    let index = this.selectedBikes.indexOf(bike);
    if (index === -1) {
      this.selectedBikes.push(bike);
    } else {
      this.selectedBikes.splice(index, 1);
    }
    console.log(this.selectedBikes);
  }

  clearSelectedBikes() {
    this.selectedBikes.splice(0, this.selectedBikes.length);
  }

  clearCustInfo() {
    this.custName = "";
    this.custId = null;
  }
}