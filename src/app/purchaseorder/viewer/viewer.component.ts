import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Vendor } from '@app/vendor/vendor';
import { Product } from '@app/product/product';
import { PurchaseOrder } from '@app/purchaseorder/purchaseorder';
import { VendorService } from '@app/vendor/vendor.service';
import { ProductService } from '@app/product/product.service';
import { PurchaseOrderService } from '@app/purchaseorder/purchaseorder.service';
import { PDFURL } from '@app/constants';
@Component({
  templateUrl: './viewer.component.html',
})
export class ViewerComponent implements OnInit, OnDestroy {
  // form
  viewerForm: FormGroup;
  vendorid: FormControl;
  poid: FormControl;
  // data
  formSubscription?: Subscription;
  vendors$?: Observable<Vendor[]>; // all vendors
  pos$?: Observable<PurchaseOrder[]>; //all purchase orders
  vendorPos$?: Observable<PurchaseOrder[]>; // all purchase orders for a particular vendor
  vendorProducts?: Product[]; // products for selected vendor
  poProducts: Product[]; //products matching po items keys
  selectedPo: PurchaseOrder; // the currently selected purchase order
  selectedVendor: Vendor; // the currently selected vendor
  // misc
  pickedPo: boolean = false;
  pickedVendor: boolean = false;
  msg: string = '';
  sub: number = 0.0;
  taxMod: number = 0.13;
  tax: number = 0.0;
  total: number = 0.0;

  constructor(
    private builder: FormBuilder,
    private vendorService: VendorService,
    private productService: ProductService,
    private purchaseorderService: PurchaseOrderService
  ) {
    this.vendorid = new FormControl('');
    this.poid = new FormControl('');
    this.viewerForm = this.builder.group({
      poid: this.poid,
      vendorid: this.vendorid,
    });
    this.selectedPo = {
      id: 0,
      vendorid: 0,
      amount: 0.0,
      podate: '',
      items: [],
    };
    this.selectedVendor = {
      id: 0,
      name: '',
      address1: '',
      city: '',
      province: '',
      postalcode: '',
      phone: '',
      type: '',
      email: '',
    };
    this.poProducts = new Array<Product>();
  } // constructor

  ngOnInit(): void {
    this.onPickVendor();
    this.onPickPo();
    this.msg = 'loading vendors and pos from server...';
    (this.vendors$ = this.vendorService.get()),
      catchError((err) => (this.msg = err.message));
    (this.pos$ = this.purchaseorderService.get()),
      catchError((err) => (this.msg = err.message));
    this.msg = 'server data loaded';
  } // ngOnInit

  ngOnDestroy(): void {
    if (this.formSubscription !== undefined) {
      this.formSubscription.unsubscribe();
    }
  } // ngOnDestroy

  /**
   * onPickVendor - Another way to use Observables, subscribe to the select change event
   * then load specific vendor products for subsequent selection
   */
  onPickVendor(): void {
    this.formSubscription = this.viewerForm
      .get('vendorid')
      ?.valueChanges.subscribe((val) => {
        this.selectedPo = {
          id: 0,
          vendorid: 0,
          podate: '',
          amount: 0.0,
          items: [],
        };
        this.selectedVendor = val;
        this.loadVendorProducts(this.selectedVendor.id);
        this.loadVendorPos();
        this.pickedPo = false;
        this.msg = 'choose purchase order for vendor';
        this.pickedVendor = true;
      });
  } // onPickVendor

  /**
   * onPickPo - subscribe to the select change event then
   * update array containing items.
   */
  onPickPo(): void {
    const poSubscription = this.viewerForm
      .get('poid')
      ?.valueChanges.subscribe((val) => {
        this.selectedPo = val;
        // retrieve just the products in the PO
        if (this.vendorProducts !== undefined) {
          this.poProducts = this.vendorProducts.filter((product) =>
            this.selectedPo?.items.some((item) => item.productid === product.id)
          );
        }
        this.pickedPo = true;
        this.sub = 0.0;
        this.tax = 0.0;
        this.total = 0.0;
        this.selectedPo.items.forEach((prd) => (this.sub += prd.price));
        this.tax = this.sub * this.taxMod;
        this.total = this.sub + this.tax;
      });
    this.formSubscription?.add(poSubscription); // add it as a child, so all can be destroyed together
  } // onPickPo

  /**
   * loadVendorPos - filter for a particular vendor's purchase orders
   */
  loadVendorPos(): void {
    this.vendorPos$ = this.pos$?.pipe(
      map((pos) =>
        // map each po in the array and check whether or not it belongs to selected vendor
        pos.filter((po) => po.vendorid === this.selectedVendor?.id)
      )
    );
  } // loadVendorPos

  /**
   * loadVendorProducts - obtain a particular vendor's products
   * we'll match the po products to them later
   */
  loadVendorProducts(id: number): void {
    // products aren't part of the page, so we don't use async pipe here
    this.msg = 'loading products...';
    this.productService
      .getSome(id)
      .subscribe((products) => (this.vendorProducts = products));
  }

  viewPdf(): void {
    window.open(`${PDFURL}${this.selectedPo.id}`, '');
  } // viewPdf
} // ViewerComponent
