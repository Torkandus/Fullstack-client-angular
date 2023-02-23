import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Vendor } from '@app/vendor/vendor';
import { Product } from '@app/product/product';
import { PurchaseOrderItem } from '@app/purchaseorder/purchaseorder-item';
import { PurchaseOrder } from '@app/purchaseorder/purchaseorder';
import { VendorService } from '@app/vendor/vendor.service';
import { ProductService } from '@app/product/product.service';
import { PurchaseOrderService } from '@app/purchaseorder/purchaseorder.service';
import { PDFURL } from '@app/constants';
@Component({
  templateUrl: './generator.component.html',
})
export class GeneratorComponent implements OnInit, OnDestroy {
  // form
  generatorForm: FormGroup;
  vendorid: FormControl;
  productid: FormControl;
  productqty: FormControl;
  // data
  formSubscription?: Subscription;
  products$?: Observable<Product[]>; // everybody's products
  vendors$?: Observable<Vendor[]>; // all vendors
  vendorproducts$?: Observable<Product[]>; // all products for a particular vendor
  items: Array<PurchaseOrderItem>; // product items that will be in purchaseorder
  selectedproducts: Product[]; // products that being displayed currently in app
  productqtys: String[];
  selectedQty: string;
  selectedProduct: Product; // the current selected product
  selectedVendor: Vendor; // the current selected vendor
  // misc
  pickedProduct: boolean;
  pickedVendor: boolean;
  generated: boolean;
  hasProducts: boolean;
  msg: string;
  qty: number;
  sub: number;
  taxMod: number = 0.13;
  tax: number;
  total: number;
  purchaseorderno: number = 0;

  constructor(
    private builder: FormBuilder,
    private vendorService: VendorService,
    private productService: ProductService,
    private purchaseorderService: PurchaseOrderService
  ) {
    this.pickedVendor = false;
    this.pickedProduct = false;
    this.generated = false;
    this.msg = '';
    this.vendorid = new FormControl('');
    this.productid = new FormControl('');
    this.productqty = new FormControl('');
    this.generatorForm = this.builder.group({
      productid: this.productid,
      vendorid: this.vendorid,
      productqty: this.productqty,
    });
    this.selectedProduct = {
      id: '',
      vendorid: 0,
      name: '',
      costprice: 0.0,
      msrp: 0.0,
      rop: 0,
      eoq: 0,
      qoh: 0,
      qoo: 0,
      qrcode: '',
      qrcodetxt: '',
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
    this.selectedQty = '';
    this.items = new Array<PurchaseOrderItem>();
    this.selectedproducts = new Array<Product>();
    this.hasProducts = false;
    this.qty = 0;
    this.productqtys = [
      'EOQ',
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
    ];
    this.sub = 0.0;
    this.tax = 0.0;
    this.total = 0.0;
  } // constructor
  ngOnInit(): void {
    this.onPickVendor();
    this.onPickProduct();
    this.msg = 'loading vendors and products from server...';
    (this.vendors$ = this.vendorService.get()),
      catchError((err) => (this.msg = err.message));
    (this.products$ = this.productService.get()),
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
    this.formSubscription = this.generatorForm
      .get('vendorid')
      ?.valueChanges.subscribe((val) => {
        this.selectedProduct = {
          id: '',
          vendorid: 0,
          name: '',
          costprice: 0.0,
          msrp: 0.0,
          rop: 0,
          eoq: 0,
          qoh: 0,
          qoo: 0,
          qrcode: '',
          qrcodetxt: '',
        };
        this.selectedVendor = val;
        this.loadVendorProducts();
        this.pickedProduct = false;
        this.hasProducts = false;
        this.msg = 'choose product for vendor';
        this.pickedVendor = true;
        this.generated = false;
        this.items = []; // array for the purchaseorder
        this.selectedproducts = []; // array for the details in app html
      });
  } // onPickVendor
  /**
   * onPickProduct - subscribe to the select change event then
   * update array containing items.
   */
  onPickProduct(): void {
    const productSubscription = this.generatorForm
      .get('productid')
      ?.valueChanges.subscribe((val) => {
        this.selectedProduct = val;
        this.pickedProduct = true;
        this.msg = 'choose qty';
        this.productqty.reset({ emitEvent: false });
      });
    this.formSubscription?.add(productSubscription); // add it as a child, so all can be destroyed together
  } // onPickProduct
  onPickQty(): void {
    this.selectedQty = this.generatorForm.value.productqty;
    if (this.selectedQty === 'EOQ') {
      this.qty = this.selectedProduct?.eoq;
    } else {
      this.qty = parseInt(this.selectedQty);
    }
    if (
      //remove entry
      this.items.find((item) => item.productid === this.selectedProduct?.id) &&
      this.qty === 0
    ) {
      this.items = this.items.filter(
        (item) => item.productid !== this.selectedProduct?.id
      );
      this.msg = `All ${this.selectedProduct.name}(s) removed`;
    } else if (
      //update entry
      this.items.find((item) => item.productid === this.selectedProduct?.id)
    ) {
      var idx = this.items.findIndex(
        (item) => item.productid === this.selectedProduct?.id
      );
      this.items[idx].qty = this.qty;
      this.items[idx].price = this.qty * this.selectedProduct.costprice;
      this.msg = `${this.qty} ${this.selectedProduct.name}(s) added`;
    } else {
      // add entry
      const item: PurchaseOrderItem = {
        id: 0,
        poid: 0,
        productid: this.selectedProduct?.id,
        qty: this.qty,
        price: this.qty * this.selectedProduct.costprice,
      };
      this.items.push(item);
      this.selectedproducts.push(this.selectedProduct);
      this.msg = `${this.qty} ${this.selectedProduct.name}(s) added`;
    }
    if (this.items.length > 0) {
      this.hasProducts = true;
    } else {
      this.hasProducts = false;
      this.msg = 'No Items';
    }
    this.sub = 0.0;
    this.tax = 0.0;
    this.total = 0.0;
    this.items.forEach((prd) => (this.sub += prd.price));
    this.tax = this.sub * this.taxMod;
    this.total = this.sub + this.tax;
  } // onPickQty
  /**
   * loadVendorProducts - filter for a particular vendor's products
   */
  loadVendorProducts(): void {
    this.vendorproducts$ = this.products$?.pipe(
      map((products) =>
        // map each product in the array and check whether or not it belongs to selected vendor
        products.filter(
          (product) => product.vendorid === this.selectedVendor?.id
        )
      )
    );
  } // loadVendorProducts
  /**
   * createPurchaseOrder - create the client side purchaseorder
   */
  createPurchaseOrder(): void {
    this.generated = false;
    const purchaseorder: PurchaseOrder = {
      id: 0,
      amount: this.total,
      podate: '',
      items: this.items,
      vendorid: this.selectedProduct.vendorid,
    };
    this.purchaseorderService.add(purchaseorder).subscribe({
      // observer object
      next: (purchaseorder: PurchaseOrder) => {
        // server should be returning purchaseorder with new id
        purchaseorder.id > 0
          ? (this.msg = `PurchaseOrder ${purchaseorder.id} added!`)
          : (this.msg = 'PurchaseOrder not added! - server error');
        this.purchaseorderno = purchaseorder.id;
      },
      error: (err: Error) =>
        (this.msg = `PurchaseOrder not added! - ${err.message}`),
      complete: () => {
        this.hasProducts = false;
        this.pickedVendor = false;
        this.pickedProduct = false;
        this.generated = true;
      },
    });
  } // createPurchaseOrder

  viewPdf(): void {
    window.open(`${PDFURL}${this.purchaseorderno}`, '');
  } // viewPdf
} // GeneratorComponent
