import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { PRODUCT_CATEGORIES } from '../../../core/models/product.model';
import { ImportStepsComponent } from './components/import-steps/import-steps.component';
import { ImportUploadComponent } from './components/import-upload/import-upload.component';
import { ImportValidationComponent } from './components/import-validation/import-validation.component';
import { ImportSuccessComponent } from './components/import-success/import-success.component';

export interface ImportRow {
  name: string;
  category: string;
  priceText: string;
  price: number;
  stockText: string;
  stock: number;
  statusText: string;
  statusType: 'ready' | 'warning' | 'error';
}

@Component({
  selector: 'app-bulk-import',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    FormsModule, 
    ImportStepsComponent,
    ImportUploadComponent,
    ImportValidationComponent,
    ImportSuccessComponent
  ],
  templateUrl: './bulk-import.component.html',
  styleUrl: './bulk-import.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BulkImportComponent {
  private productService = inject(ProductService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  // States & Config
  readonly currentUser = this.productService.currentUser;
  readonly slotsRemaining = this.productService.slotsRemaining;

  // Wizard Signals
  readonly currentStep = signal<number>(1);
  readonly selectedFileName = signal<string | null>(null);
  readonly importRows = signal<ImportRow[]>([]);
  readonly loading = signal<boolean>(false);

  // Computed summary metrics
  readonly readyCount = computed(() => this.importRows().filter(r => r.statusType === 'ready').length);
  readonly warningsCount = computed(() => this.importRows().filter(r => r.statusType === 'warning').length);
  readonly errorsCount = computed(() => this.importRows().filter(r => r.statusType === 'error').length);

  /**
   * Triggers when a file is selected or dropped
   */
  onFileSelected(event: any): void {
    const file = event.target?.files?.[0];
    if (file) {
      this.selectedFileName.set(file.name);
      this.loadPreviewData();
    }
  }

  /**
   * Populate mock preview data matching the screenshot specs
   */
  private loadPreviewData(): void {
    const rows: ImportRow[] = [
      { name: 'Portland Cement 50kg', category: 'Cement', priceText: 'SAR 22.50', price: 22.50, stockText: '320', stock: 320, statusText: 'Ready', statusType: 'ready' },
      { name: 'White Cement 25kg', category: 'Cement', priceText: 'SAR 38.00', price: 38.00, stockText: '45', stock: 45, statusText: 'Ready', statusType: 'ready' },
      { name: 'M8 Hex Bolt Set', category: 'Fasteners', priceText: 'SAR 45.00', price: 45.00, stockText: '200', stock: 200, statusText: 'Ready', statusType: 'ready' },
      { name: 'PVC Pipe 3/4"', category: 'Plumbing', priceText: 'SAR 12.00', price: 12.00, stockText: '80', stock: 80, statusText: 'Unknown category', statusType: 'warning' },
      { name: 'Makita 18V Drill', category: 'Power Tools', priceText: '', price: 0, stockText: '12', stock: 12, statusText: 'Price missing', statusType: 'error' },
      { name: 'Sand Paper 120 Grit', category: 'Abrasives', priceText: 'SAR 5.50', price: 5.50, stockText: '500', stock: 500, statusText: 'Unknown category', statusType: 'warning' },
      { name: 'Steel Rebar 12mm', category: 'Steel & Metal', priceText: 'SAR 28.50', price: 28.50, stockText: '150', stock: 150, statusText: 'Ready', statusType: 'ready' },
      { name: 'Jotun Paint White 18L', category: 'Paint & Finishes', priceText: 'SAR 320.00', price: 320.00, stockText: '45', stock: 45, statusText: 'Ready', statusType: 'ready' },
      { name: 'Concrete Blocks 20cm', category: 'Cement & Blocks', priceText: 'SAR 3.50', price: 3.50, stockText: '1200', stock: 1200, statusText: 'Ready', statusType: 'ready' },
      { name: 'Copper Wire 100m', category: 'Electrical', priceText: 'SAR 145.00', price: 145.00, stockText: '60', stock: 60, statusText: 'Ready', statusType: 'ready' },
      { name: 'Safety Helmet', category: 'Safety Supplies', priceText: 'SAR 25.00', price: 25.00, stockText: '110', stock: 110, statusText: 'Ready', statusType: 'ready' },
    ];
    this.importRows.set(rows);
    this.currentStep.set(2);
    this.toastService.success(`Loaded "${this.selectedFileName()}" with validation preview.`);
  }

  /**
   * Resets wizard to Step 1
   */
  resetToStep1(): void {
    this.importRows.set([]);
    this.selectedFileName.set(null);
    this.currentStep.set(1);
    this.toastService.info('File review cleared. You can select another file.');
  }

  /**
   * Triggers download of the template file
   */
  downloadTemplate(): void {
    const csvContent = "data:text/csv;charset=utf-8,Product Name,Category,Price,Stock,Description\n"
      + "Portland Cement 50kg,Cement,22.50,320,High strength cement\n"
      + "White Cement 25kg,Cement,38.00,45,Premium white cement\n"
      + "M8 Hex Bolt Set,Fasteners,45.00,200,Steel bolt sets\n"
      + "PVC Pipe 3/4\",Plumbing,12.00,80,Drainage pipe\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "products_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.toastService.success('CSV Template download started.');
  }

  /**
   * Commits the valid rows to the catalog
   */
  importProducts(): void {
    if (this.loading() || this.readyCount() === 0) return;

    this.loading.set(true);

    const validRows = this.importRows().filter(r => r.statusType === 'ready');
    const importPayload = validRows.map(r => ({
      name: r.name,
      sku: this.generateSku(r.name, r.category),
      category: this.mapCategory(r.category),
      price: r.price,
      stock: r.stock,
      description: `${r.name} imported from bulk tool.`,
      imageUrl: PRODUCT_CATEGORIES.find(c => c.name === this.mapCategory(r.category))?.iconPath || 'images/category-icons/miscellaneous.svg',
      status: 'Available' as const
    }));

    this.productService.bulkImport(importPayload).subscribe({
      next: () => {
        setTimeout(() => {
          this.loading.set(false);
          this.currentStep.set(3);
          this.toastService.success(`Successfully imported ${validRows.length} items.`);
        }, 1200);
      },
      error: (err) => {
        this.toastService.error(err?.message || 'Import failed.');
        this.loading.set(false);
      }
    });
  }

  /**
   * Helper to categorize items to standard types
   */
  private mapCategory(cat: string): string {
    const lower = cat.toLowerCase();
    if (lower.includes('cement') || lower.includes('block')) return 'Cement & Blocks';
    if (lower.includes('steel') || lower.includes('metal')) return 'Steel & Metal';
    if (lower.includes('paint') || lower.includes('finish')) return 'Paint & Finishes';
    if (lower.includes('electrical') || lower.includes('wire')) return 'Electrical';
    if (lower.includes('plumbing')) return 'Plumbing';
    if (lower.includes('safety') || lower.includes('helmet')) return 'Safety Supplies';
    if (lower.includes('fastener') || lower.includes('bolt') || lower.includes('hardware')) return 'Tools & Hardware';
    return 'Miscellaneous';
  }

  /**
   * Standard SKU generator
   */
  private generateSku(name: string, category: string): string {
    const storePrefix = this.currentUser()
      ? this.currentUser()!.storeName.toUpperCase().split(' ').map((w: string) => w[0]).join('').replace(/[^A-Z]/g, '')
      : 'MYB';
    const catAbbr = category ? category.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '') : 'GEN';
    const prodAbbr = name ? name.toUpperCase().split(' ').slice(0, 2).map((w: string) => w[0]).join('').replace(/[^A-Z]/g, '') : 'ITM';
    const randNum = Math.floor(100 + Math.random() * 900);
    return `${storePrefix}-${catAbbr}-${prodAbbr || 'ITM'}-${randNum}`;
  }
}
