import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// app specific
import { MatComponentsModule } from './mat-components/mat-components.module';
import { HomeComponent } from './home/home.component';
import { VendorModule } from './vendor/vendor.module';
import { ProductModule } from './product/product.module';
import { PurchaseorderModule } from './purchaseorder/purchaseorder.module';
import { DeleteDialogComponent } from './delete-dialog/delete-dialog.component';
@NgModule({
  declarations: [AppComponent, HomeComponent, DeleteDialogComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatComponentsModule,
    HttpClientModule,
    VendorModule,
    ProductModule,
    PurchaseorderModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
