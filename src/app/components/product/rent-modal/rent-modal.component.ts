import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { UserService } from './../../../services/user.service';
import { ProductService } from './../../../services/product.service';
import { OrderService } from './../../../services/order.service';
import { Component, OnInit, Input } from '@angular/core';
import { NgbDateStruct, NgbTimeStruct, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { Order } from '../../../types/order';
import { Product } from '../../../types/product';
import { User } from '../../../types/user';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import { BsModalRef } from 'ngx-bootstrap';

@Component({
  selector: 'app-rent-modal',
  templateUrl: './rent-modal.component.html',
  styleUrls: ['./rent-modal.component.scss']
})
export class RentModalComponent implements OnInit {

  order: Order;
  product: Product;
  user: User;

  count: number;
  one_day = 1000 * 60 * 60 * 24;
  one_hour = 1000 * 60 * 60;

  form: FormGroup;

  fromDate: NgbDateStruct;
  toDate: NgbDateStruct;
  fromTime: NgbTimeStruct;
  toTime: NgbTimeStruct;
  
  constructor(
    private ngbDateParserFormatter: NgbDateParserFormatter,
    private orderService: OrderService,
    private productService: ProductService,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private bsModalRef: BsModalRef
  ) { }

  ngOnInit() {
    this.order = this.orderService.getOrder();
    this.fromDate = { day: this.order.fromDateDay, month: this.order.fromDateMonth, year: this.order.fromDateYear};
    this.toDate = { day: this.order.toDateDay, month: this.order.toDateMonth, year: this.order.toDateYear};
    this.fromTime = { hour: this.order.fromDateHour, minute: this.order.fromDateMinute, second: 0};
    this.toTime = { hour: this.order.toDateHour, minute: this.order.toDateMinute, second: 0};
    this.productService.getById(this.order._productId)
      .catch(err => {
        return Observable.throw(new Error(`${err.status} ${err.msg}`));
      })
      .subscribe(product => {
        this.product = product[0];
        this.periodCount();
      });
    this.userService.getMe()
      .catch(err => {
        return Observable.throw(err);
      })
      .subscribe(user => {
        this.user = user;
      });
    this.form = this.createForm();
  }

  createForm() {
    return this.formBuilder.group({
      _rentorId: '',
      _clientId: '',
      address: this.formBuilder.control('', Validators.required),
      city: this.formBuilder.control('', Validators.required),
      region: this.formBuilder.control('', Validators.required),
      zip: this.formBuilder.control('', Validators.required),
      _productId: '',
      quantity: null,
      price: null,
      fromDateYear: null,
      fromDateMonth: null,
      fromDateDay: null,
      fromDateHour: null,
      fromDateMinute: null,
      toDateYear: null,
      toDateMonth: null,
      toDateDay: null,
      toDateHour: null,
      toDateMinute: null,
      status: 'reserved'
    });
  }

  periodCount(): void {
    let from = new Date(this.order.fromDateYear,this.order.fromDateMonth,this.order.fromDateDay);
    let to = new Date(this.order.toDateYear, this.order.toDateMonth, this.order.toDateDay);
    if (this.product.pricePer == 'Day') {
      this.count = (to.getTime() - from.getTime()) / this.one_day;
    }
    else if (this.product.pricePer == 'Hour') {
      this.count = (to.getTime() - from.getTime()) / this.one_hour;
    }
    else {
      this.count = 0;
    }
  }
  
  sendOrder(): void{
    if(this.form.valid){
      this.form.patchValue({
        _rentorId: this.order._rentorId,
        _clientId: this.order._clientId,
        _productId: this.order._productId,
        quantity: this.order.quantity,
        price: this.count*this.order.quantity*this.product.price,
        fromDateYear: this.order.fromDateYear,
        fromDateMonth: this.order.fromDateMonth,
        fromDateDay: this.order.fromDateDay,
        fromDateHour: this.order.fromDateHour,
        fromDateMinute: this.order.fromDateMinute,
        toDateYear: this.order.toDateYear,
        toDateMonth: this.order.toDateMonth,
        toDateDay: this.order.toDateDay,
        toDateHour: this.order.toDateHour,
        toDateMinute: this.order.toDateMinute,
      });
      this.orderService.create(this.form.value)
        .catch(err => {
          return Observable.throw(new Error(`${err.status} ${err.msg}`));
        })
        .subscribe(order => {
          this.bsModalRef.hide();
        })
    }
  }

}