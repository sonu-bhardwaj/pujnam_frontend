import React, { useEffect, useState } from 'react';
import ExcelJS from 'exceljs';
import { Plus, Edit, Trash2, Search, Info } from 'lucide-react';
import { Product } from '../../types';
import { productsApi, categoriesApi } from '../../lib/api';
import { mapProduct, mapCategory } from '../../lib/mappers';
import { isPreferredWeightFormat, normalizeWeight } from '../../lib/weight';
import { useNotification } from '../../contexts/NotificationContext';
import { placeholders } from '../../lib/placeholders';
import { ImageUpload } from './ImageUpload';

export const AdminProducts: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkRows, setBulkRows] = useState<any[]>([]);
  const [bulkErrors, setBulkErrors] = useState<string[]>([]);
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);
  const [isDeletingProducts, setIsDeletingProducts] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    category: '',
    images: [] as string[],
    stock: 0,
    featured: false,
    isBestseller: false,
    isActive: true,
    // Product detail fields
    productFeatures: '',
    idealFor: '',
    bestUses: '',
    spiritualSignificance: '',
    howToUse: '',
    whyYoullLoveIt: '',
    whatMakesUsSpecial: '',
    storePromise: '',
    weight: '',
    deity: '',
    shortDescription: '',
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await productsApi.getAll({ limit: 200, sort: '-createdAt' });
      if (error) {
        console.error('Unable to load products', error);
        alert('Error loading products: ' + error);
        setLoading(false);
        return;
      }
      console.log('Admin Products API response:', data);
      const productsList = data?.products || (Array.isArray(data) ? data : []);
      console.log('Admin Products list:', productsList, 'Type:', typeof productsList, 'Is Array:', Array.isArray(productsList));
      const mapped = Array.isArray(productsList) ? productsList.map(mapProduct) : [];
      console.log('Admin Mapped products:', mapped.length);
      setProducts(mapped);
      setSelectedProductIds((prev) => prev.filter((id) => mapped.some((p) => p.id === id)));
    } catch (err) {
      console.error('Error fetching products in admin:', err);
      alert('Error loading products: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const { data, error } = await categoriesApi.getAll();
    if (!error && data?.categories) {
      setCategories((data.categories || []).map(mapCategory));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const normalizedStock = Number(formData.stock) || 0;
      const submitData = {
        ...formData,
        images: formData.images.filter(Boolean),
        originalPrice: formData.originalPrice || undefined,
        short_description: formData.shortDescription,
        isBestseller: formData.isBestseller,
        stock: normalizedStock,
        isActive: normalizedStock > 0 ? formData.isActive : false,
        attributes: {
          features: formData.productFeatures,
          idealFor: formData.idealFor,
          bestUses: formData.bestUses,
          spiritualSignificance: formData.spiritualSignificance,
          howToUse: formData.howToUse,
          whyYoullLoveIt: formData.whyYoullLoveIt,
          whatMakesUsSpecial: formData.whatMakesUsSpecial,
          promise: formData.storePromise,
          weight: normalizeWeight(formData.weight),
        },
        deity: formData.deity || undefined,
      };

      if (editingProduct) {
        const { error } = await productsApi.update(editingProduct.id, submitData);
        if (error) {
          showError('Failed to update product: ' + error);
          return;
        }
        showSuccess('Product updated successfully!');
      } else {
        const { error } = await productsApi.create(submitData);
        if (error) {
          showError('Failed to create product: ' + error);
          return;
        }
        showSuccess('Product created successfully!');
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product', error);
    }
  };

  const parseBoolean = (value: string) => {
    const normalized = String(value || '').trim().toLowerCase();
    if (['true', '1', 'yes', 'y'].includes(normalized)) return true;
    if (['false', '0', 'no', 'n'].includes(normalized)) return false;
    return false;
  };

  const parseNumber = (value: string) => {
    const num = parseFloat(String(value || '').trim());
    return Number.isFinite(num) ? num : 0;
  };

  const parseBooleanOrUndefined = (value: string) => {
    const normalized = String(value || '').trim().toLowerCase();
    if (['true', '1', 'yes', 'y'].includes(normalized)) return true;
    if (['false', '0', 'no', 'n'].includes(normalized)) return false;
    return undefined;
  };

  const findCategoryId = (value: string) => {
    const normalized = String(value || '').trim().toLowerCase();
    if (!normalized) return '';
    const byId = categories.find((c) => String(c.id).toLowerCase() === normalized);
    if (byId) return byId.id;
    const bySlug = categories.find((c) => String(c.slug || '').toLowerCase() === normalized);
    if (bySlug) return bySlug.id;
    const byName = categories.find((c) => String(c.name || '').toLowerCase() === normalized);
    return byName ? byName.id : '';
  };

  const parseDelimitedText = (text: string) => {
    const trimmed = text.replace(/\r\n/g, '\n').trim();
    if (!trimmed) return { headers: [], rows: [] };
    const lines = trimmed.split('\n').filter((l) => l.trim().length > 0);
    if (lines.length === 0) return { headers: [], rows: [] };
    const delimiter = lines[0].includes('\t') ? '\t' : ',';

    const parseLine = (line: string) => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i += 1) {
        const ch = line[i];
        const next = line[i + 1];
        if (ch === '"') {
          if (inQuotes && next === '"') {
            current += '"';
            i += 1;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (ch === delimiter && !inQuotes) {
          result.push(current);
          current = '';
        } else {
          current += ch;
        }
      }
      result.push(current);
      return result.map((v) => v.trim());
    };

    const headers = parseLine(lines[0]).map((h) => h.trim());
    const rows = lines.slice(1).map((line) => parseLine(line));
    return { headers, rows };
  };

  const buildBulkRows = (text: string) => {
    const { headers, rows } = parseDelimitedText(text);
    if (headers.length === 0) {
      setBulkRows([]);
      setBulkErrors(['No headers found.']);
      return;
    }

    const requiredHeaders = ['name', 'description', 'price', 'originalPrice', 'stock', 'isActive', 'category'];
    const missing = requiredHeaders.filter((h) => !headers.includes(h));
    if (missing.length > 0) {
      setBulkRows([]);
      setBulkErrors([`Missing required columns: ${missing.join(', ')}`]);
      return;
    }

    const parsed = rows.map((row, index) => {
      const data: Record<string, string> = {};
      headers.forEach((h, i) => {
        data[h] = row[i] ?? '';
      });

      const imagesRaw = String(data.images || '').trim();
      const imageLink = String(data.imageLink || data.image_url || '').trim();
      const images = imagesRaw
        ? imagesRaw.split(/[\|;]/).map((s) => s.trim()).filter(Boolean)
        : imageLink
          ? [imageLink]
          : [];

      const categoryId = findCategoryId(data.category);
      const errors: string[] = [];
      const warnings: string[] = [];
      if (!data.name) errors.push('Missing name');
      if (!data.description) errors.push('Missing description');
      if (!data.price) errors.push('Missing price');
      if (!data.originalPrice) errors.push('Missing original price');
      if (!data.stock) errors.push('Missing stock');
      if (!data.category) errors.push('Missing category');
      if (data.category && !categoryId) errors.push('Category not found');
      if (data.weight && !isPreferredWeightFormat(data.weight)) {
        warnings.push('Weight format suggestion: use values like 100 ml, 250 gm, 2 pcs, or 1 stick');
      }
      const normalizedWeight = normalizeWeight(data.weight);
      const parsedIsActive = parseBooleanOrUndefined(data.isActive);

      const stockValue = parseNumber(data.stock);
      const submitData = {
        name: data.name,
        description: data.description,
        short_description: data.shortDescription || '',
        price: parseNumber(data.price),
        originalPrice: data.originalPrice ? parseNumber(data.originalPrice) : undefined,
        category: categoryId,
        images,
        stock: stockValue,
        featured: parseBoolean(data.featured),
        isBestseller: parseBoolean(data.isBestseller),
        isActive: stockValue > 0 ? (parsedIsActive ?? true) : false,
        deity: data.deity || undefined,
        attributes: {
          features: data.productFeatures || '',
          idealFor: data.idealFor || '',
          bestUses: data.bestUses || '',
          spiritualSignificance: data.spiritualSignificance || '',
          howToUse: data.howToUse || '',
          whyYoullLoveIt: data.whyYoullLoveIt || '',
          whatMakesUsSpecial: data.whatMakesUsSpecial || '',
          promise: data.storePromise || '',
          weight: normalizedWeight,
        },
      };

      return { index: index + 1, submitData, errors, warnings };
    });

    const normalizePriceKey = (value: any) => {
      const num = Number(value);
      return Number.isFinite(num) ? num : 0;
    };
    const buildNamePriceKey = (name: string, price: any) => `${String(name || '').trim().toLowerCase()}::${normalizePriceKey(price)}`;

    const existingByName = new Map(
      products
        .filter((p) => String(p.name || '').trim().length > 0)
        .map((p) => [
          buildNamePriceKey(String(p.name || ''), (p as any).price),
          {
            id: p.id,
            name: p.name,
            price: Number((p as any).price ?? 0),
            stock: Number((p as any).stock_quantity ?? p.stock ?? 0),
          },
        ])
    );

    const seenUploadByName = new Map<string, { index: number; stock: number; price: number }>();
    const withDuplicates = parsed.map((row) => {
      const nameKey = String(row.submitData.name || '').trim().toLowerCase();
      const priceKey = normalizePriceKey(row.submitData.price);
      const namePriceKey = `${nameKey}::${priceKey}`;
      const incomingStock = Number(row.submitData.stock ?? 0);

      if (!nameKey) {
        return {
          ...row,
          isDuplicate: false,
          stockChanged: false,
          duplicateSource: null,
          existingStock: undefined,
        };
      }

      const existing = existingByName.get(namePriceKey);
      if (existing) {
        return {
          ...row,
          isDuplicate: true,
          stockChanged: incomingStock !== Number(existing.stock ?? 0),
          duplicateSource: 'existing',
          existingStock: Number(existing.stock ?? 0),
          duplicateName: existing.name,
        };
      }

      const seenUpload = seenUploadByName.get(namePriceKey);
      if (seenUpload) {
        const uploadDuplicateRow = {
          ...row,
          isDuplicate: true,
          stockChanged: incomingStock !== Number(seenUpload.stock ?? 0),
          duplicateSource: 'upload',
          existingStock: Number(seenUpload.stock ?? 0),
          errors: [...row.errors, `Duplicate product name + price in upload file (first at row ${seenUpload.index})`],
        };
        return uploadDuplicateRow;
      }

      seenUploadByName.set(namePriceKey, { index: row.index, stock: incomingStock, price: priceKey });
      return {
        ...row,
        isDuplicate: false,
        stockChanged: false,
        duplicateSource: null,
        existingStock: undefined,
      };
    });

    setBulkRows(withDuplicates);
    setBulkErrors([]);
  };

  const handleBulkSubmit = async () => {
    const hasErrors = bulkRows.some((r) => r.errors.length > 0);
    if (hasErrors) {
      showError('Please fix errors in the bulk data before submitting.');
      return;
    }
    if (bulkRows.length === 0) {
      showError('No valid rows to submit.');
      return;
    }

    setIsBulkSubmitting(true);
    try {
      const existingDuplicates = bulkRows.filter((r) => r.isDuplicate && r.duplicateSource === 'existing');
      const stockChangedDuplicates = existingDuplicates.filter((r) => r.stockChanged);

      let updateStockOnDuplicate = false;
      if (stockChangedDuplicates.length > 0) {
        const sampleNames = stockChangedDuplicates
          .slice(0, 5)
          .map((r) => r.submitData.name)
          .join(', ');
        const confirmMessage = `Found ${stockChangedDuplicates.length} existing product duplicate(s) with same name + same price and changed stock.\n\nDo you want to update stock for those existing products instead of creating duplicates?\n\nExamples: ${sampleNames}`;
        const confirmed = window.confirm(confirmMessage);
        if (!confirmed) {
          showError('Bulk upload cancelled. Stock update confirmation is required for duplicate name + price rows with stock changes.');
          return;
        }
        updateStockOnDuplicate = true;
      }

      const payload = bulkRows.map((r) => r.submitData);
      if (payload.length === 0) {
        showError('No valid rows to submit.');
        return;
      }

      const runBulk = async (enableStockUpdate: boolean) => {
        const { error, data } = await productsApi.bulkCreate(payload, { updateStockOnDuplicate: enableStockUpdate });
        if (error) {
          throw new Error(error);
        }
        return data?.results || [];
      };

      let results: any[] = await runBulk(updateStockOnDuplicate);

      // Backend-authoritative fallback: if duplicates with changed stock are returned,
      // ask confirmation and retry with stock update enabled.
      const serverStockChangedDuplicates = results.filter(
        (r: any) => r.status === 'duplicate' && r.stockChanged
      );
      if (!updateStockOnDuplicate && serverStockChangedDuplicates.length > 0) {
        const sampleNames = serverStockChangedDuplicates
          .slice(0, 5)
          .map((r: any) => r.name)
          .join(', ');
        const confirmMessage = `Found ${serverStockChangedDuplicates.length} existing product duplicate(s) with same name + same price and changed stock.\n\nDo you want to update stock for those existing products?\n\nExamples: ${sampleNames}`;
        const confirmed = window.confirm(confirmMessage);
        if (!confirmed) {
          showError('Bulk upload cancelled. Stock update confirmation is required for duplicate name + price rows with stock changes.');
          return;
        }
        results = await runBulk(true);
      }

      const createdCount = results.filter((r: any) => r.status === 'created').length;
      const updatedStockCount = results.filter((r: any) => r.status === 'updated_stock').length;
      const duplicateCount = results.filter((r: any) => r.status === 'duplicate').length;
      const errors = results.filter((r: any) => r.status === 'error');

      if (errors.length > 0) {
        showError(`Some rows failed (${errors.length}). Check the list below.`);
        return;
      }

      if (createdCount === 0 && updatedStockCount === 0 && duplicateCount > 0) {
        showError(`No new product was created. ${duplicateCount} duplicate name row(s) were blocked.`);
        return;
      }

      showSuccess(`Created: ${createdCount}, Stock Updated: ${updatedStockCount}, Duplicates Blocked: ${duplicateCount}`);
      setIsBulkModalOpen(false);
      setBulkRows([]);
      setBulkErrors([]);
      fetchProducts();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bulk create failed.';
      showError('Bulk create failed: ' + errorMessage);
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  const getBulkRowColorClass = (row: any) => {
    if (row.errors?.length > 0) return 'bg-red-50';
    if (row.isDuplicate && row.stockChanged) return 'bg-blue-50';
    if (row.isDuplicate) return 'bg-amber-50';
    if (row.warnings?.length > 0) return 'bg-yellow-50';
    return 'bg-green-50';
  };

  const downloadBulkExcelTemplate = async () => {
    // Always fetch latest categories before generating template
    let latestCategories = categories;
    const { data: categoriesData, error: categoriesError } = await categoriesApi.getAll();
    if (!categoriesError && categoriesData?.categories) {
      latestCategories = (categoriesData.categories || []).map(mapCategory);
      setCategories(latestCategories);
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Products');
    const categorySheet = workbook.addWorksheet('Categories');

    const headers = ['name', 'price', 'originalPrice', 'stock', 'isActive', 'category', 'description', 'weight', 'imageLink'];
    sheet.addRow(headers);

    const sampleCategory = latestCategories[0]?.name || 'Category Name';
    sheet.addRow([
      'Puja Kit',
      499,
      599,
      25,
      '',
      sampleCategory,
      'Complete puja kit with essentials',
      '100 gm',
      'https://example.com/product-image.jpg',
    ]);
    // Keep user input cells editable.
    for (let row = 2; row <= 100; row += 1) {
      for (let col = 1; col <= 9; col += 1) {
        sheet.getRow(row).getCell(col).protection = { locked: false };
      }
    }
    sheet.getCell('E2').value = { formula: 'IF(D2<=0,FALSE,TRUE)' };
    sheet.getCell('E2').protection = { locked: true };

    // Column widths
    sheet.columns = [
      { width: 24 },
      { width: 12 },
      { width: 16 },
      { width: 10 },
      { width: 10 },
      { width: 24 },
      { width: 40 },
      { width: 16 },
      { width: 44 },
    ];

    // Categories list for dropdown
    const categoryNames = latestCategories.map((c) => c.name).filter(Boolean);
    categoryNames.forEach((name, idx) => {
      categorySheet.getCell(`A${idx + 1}`).value = name;
    });
    categorySheet.state = 'hidden';

    if (categoryNames.length > 0) {
      const endRow = categoryNames.length;
      for (let row = 2; row <= 100; row += 1) {
        const cell = sheet.getCell(`F${row}`);
        cell.dataValidation = {
          type: 'list',
          allowBlank: false,
          formulae: [`Categories!$A$1:$A$${endRow}`],
          showErrorMessage: true,
          errorTitle: 'Invalid Category',
          error: 'Select a category from the list.',
        };
      }
    }

    // Protect sheet so formula cells are not accidentally overwritten.
    await sheet.protect('pujnam-template', {
      selectLockedCells: true,
      selectUnlockedCells: true,
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bulk-products-template.xlsx';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    const attrs = product.attributes || {};
    setFormData({
      name: product.name,
      description: product.description || '',
      shortDescription: product.short_description || '',
      price: product.price,
      originalPrice: product.compare_at_price || product.originalPrice || 0,
      category: product.category_id || '',
      images: product.images || [],
      stock: product.stock_quantity ?? product.stock ?? 0,
      featured: product.is_featured ?? product.featured ?? false,
      isBestseller: product.is_bestseller ?? false,
      isActive: product.is_active ?? product.isActive ?? true,
      productFeatures: (attrs as any).features || (attrs as any).productFeatures || '',
      idealFor: (attrs as any).idealFor || (attrs as any).ideal_for || '',
      bestUses: (attrs as any).bestUses || (attrs as any).best_uses || '',
      spiritualSignificance: (attrs as any).spiritualSignificance || (attrs as any).spiritual_significance || '',
      howToUse: (attrs as any).howToUse || (attrs as any).how_to_use || '',
      whyYoullLoveIt: (attrs as any).whyYoullLoveIt || (attrs as any).why_youll_love_it || '',
      whatMakesUsSpecial: (attrs as any).whatMakesUsSpecial || (attrs as any).what_makes_us_special || '',
      storePromise: (attrs as any).promise || (attrs as any).storePromise || '',
      weight: (attrs as any).weight || '',
      deity: product.deity || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setPendingDeleteIds([id]);
    setIsDeleteConfirmModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      originalPrice: 0,
      category: '',
      images: [],
      stock: 0,
      featured: false,
      isBestseller: false,
      isActive: true,
      productFeatures: '',
      idealFor: '',
      bestUses: '',
      spiritualSignificance: '',
      howToUse: '',
      whyYoullLoveIt: '',
      whatMakesUsSpecial: '',
      storePromise: '',
      weight: '',
      deity: '',
      shortDescription: '',
    });
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCount = selectedProductIds.length;
  const allFilteredSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((product) => selectedProductIds.includes(product.id));

  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      const filteredIds = new Set(filteredProducts.map((p) => p.id));
      setSelectedProductIds((prev) => prev.filter((id) => !filteredIds.has(id)));
      return;
    }

    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      filteredProducts.forEach((p) => next.add(p.id));
      return Array.from(next);
    });
  };

  const openDeleteSelectedConfirm = () => {
    if (selectedProductIds.length === 0) {
      showError('Please select at least one product to delete.');
      return;
    }
    setPendingDeleteIds(selectedProductIds);
    setIsDeleteConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (pendingDeleteIds.length === 0) {
      setIsDeleteConfirmModalOpen(false);
      return;
    }

    setIsDeletingProducts(true);
    try {
      const results = await Promise.allSettled(
        pendingDeleteIds.map((id) => productsApi.delete(id))
      );

      let successCount = 0;
      let failedCount = 0;

      results.forEach((result) => {
        if (result.status === 'fulfilled' && !result.value.error) {
          successCount += 1;
        } else {
          failedCount += 1;
        }
      });

      if (successCount > 0) {
        showSuccess(
          successCount === 1
            ? 'Product deleted successfully!'
            : `${successCount} products deleted successfully!`
        );
      }

      if (failedCount > 0) {
        showError(`${failedCount} product(s) could not be deleted.`);
      }

      setSelectedProductIds((prev) => prev.filter((id) => !pendingDeleteIds.includes(id)));
      setIsDeleteConfirmModalOpen(false);
      setPendingDeleteIds([]);
      fetchProducts();
    } catch (error) {
      showError('Failed to delete selected products.');
    } finally {
      setIsDeletingProducts(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-[#1A1A1A]">Product Management</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setIsBulkModalOpen(true);
            }}
            className="btn-secondary flex items-center gap-2"
          >
            <Plus size={20} />
            Bulk Add
          </button>
          <button
            onClick={() => {
              resetForm();
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Add New Product
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2">
          <Search className="text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-gray-700">
          Selected products: <span className="font-semibold text-[#1A1A1A]">{selectedCount}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={toggleSelectAllFiltered}
            className="btn-secondary text-sm"
          >
            {allFilteredSelected ? 'Unselect All Visible' : 'Select All Visible'}
          </button>
          <button
            type="button"
            onClick={() => setSelectedProductIds([])}
            disabled={selectedCount === 0}
            className="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear Selection
          </button>
          <button
            type="button"
            onClick={openDeleteSelectedConfirm}
            disabled={selectedCount === 0}
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete Selected
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500">Loading products...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleSelectAllFiltered}
                    className="w-4 h-4 text-[#FF8C00] border-gray-300 rounded focus:ring-[#FF8C00]"
                  />
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Image</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Stock</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedProductIds.includes(product.id)}
                    onChange={() => toggleProductSelection(product.id)}
                    className="w-4 h-4 text-[#FF8C00] border-gray-300 rounded focus:ring-[#FF8C00]"
                  />
                </td>
                <td className="px-6 py-4">
                  <img
                    src={product.image_url || product.images?.[0] || placeholders.small}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium text-[#1A1A1A]">{product.name}</p>
                  {product.deity && <p className="text-sm text-gray-500">{product.deity}</p>}
                </td>
                <td className="px-6 py-4">
                  <p className="font-semibold text-[#FF8C00]">₹{product.price}</p>
                  {product.compare_at_price && (
                    <p className="text-sm text-gray-400 line-through">₹{product.compare_at_price}</p>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      (product.stock_quantity ?? 0) < (product.low_stock_threshold ?? 5)
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {product.stock_quantity ?? product.stock ?? 0} units
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      product.is_active ?? product.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {product.is_active ?? product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No products found. Check browser console for details.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#1A1A1A]">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingProduct(null);
                  resetForm();
                }}
                className="text-gray-500 hover:text-[#1A1A1A]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Short Description</label>
                <textarea
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  rows={2}
                  placeholder="Brief description shown on product cards"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                  placeholder="Full product description (shown in Description accordion)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Original Price (₹)</label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Quantity *</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Weight</label>
                  <input
                    type="text"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    onBlur={(e) => setFormData({ ...formData, weight: normalizeWeight(e.target.value) })}
                    placeholder="e.g., 100 ml, 500 gm, 2 pcs, 1 stick"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Deity</label>
                  <input
                    type="text"
                    value={formData.deity}
                    onChange={(e) => setFormData({ ...formData, deity: e.target.value })}
                    placeholder="e.g., Lord Shiva, Goddess Durga"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Images</label>
                <div className="mb-3 flex gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-800">
                  <Info size={18} className="flex-shrink-0 mt-0.5" />
                  <span>
                    Use <strong>square images</strong> for consistent product cards. Recommended size: <strong>800×800 px</strong> or 1000×1000 px. First image is used as the main thumbnail.
                  </span>
                </div>
                <ImageUpload
                  value={formData.images}
                  onChange={(urls) => setFormData({ ...formData, images: Array.isArray(urls) ? urls : [urls] })}
                  multiple={true}
                  label=""
                />
              </div>

              <div className="flex gap-4 flex-wrap">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 text-[#FF8C00] border-gray-300 rounded focus:ring-[#FF8C00]"
                  />
                  <span className="text-sm font-semibold text-gray-700">Featured</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isBestseller}
                    onChange={(e) => setFormData({ ...formData, isBestseller: e.target.checked })}
                    className="w-4 h-4 text-[#FF8C00] border-gray-300 rounded focus:ring-[#FF8C00]"
                  />
                  <span className="text-sm font-semibold text-gray-700">Best Seller</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-[#FF8C00] border-gray-300 rounded focus:ring-[#FF8C00]"
                  />
                  <span className="text-sm font-semibold text-gray-700">Active</span>
                </label>
              </div>

              {/* Product Detail Accordion Fields */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">Product Detail Sections</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Product Features</label>
                    <textarea
                      value={formData.productFeatures}
                      onChange={(e) => setFormData({ ...formData, productFeatures: e.target.value })}
                      rows={3}
                      placeholder="Key features and highlights of the product"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ideal For</label>
                    <textarea
                      value={formData.idealFor}
                      onChange={(e) => setFormData({ ...formData, idealFor: e.target.value })}
                      rows={2}
                      placeholder="Who should use this product (e.g., Daily puja rituals, festivals)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Best Uses</label>
                    <textarea
                      value={formData.bestUses}
                      onChange={(e) => setFormData({ ...formData, bestUses: e.target.value })}
                      rows={2}
                      placeholder="Best use cases for this product"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Spiritual Significance</label>
                    <textarea
                      value={formData.spiritualSignificance}
                      onChange={(e) => setFormData({ ...formData, spiritualSignificance: e.target.value })}
                      rows={3}
                      placeholder="Spiritual and religious significance of the product"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">How to Use?</label>
                    <textarea
                      value={formData.howToUse}
                      onChange={(e) => setFormData({ ...formData, howToUse: e.target.value })}
                      rows={3}
                      placeholder="Instructions on how to use the product"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Why You'll Love It?</label>
                    <textarea
                      value={formData.whyYoullLoveIt}
                      onChange={(e) => setFormData({ ...formData, whyYoullLoveIt: e.target.value })}
                      rows={2}
                      placeholder="Reasons why customers will love this product"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">What Makes Us Special?</label>
                    <textarea
                      value={formData.whatMakesUsSpecial}
                      onChange={(e) => setFormData({ ...formData, whatMakesUsSpecial: e.target.value })}
                      rows={2}
                      placeholder="What makes this product special and unique"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Pujnam Store's Promise</label>
                    <textarea
                      value={formData.storePromise}
                      onChange={(e) => setFormData({ ...formData, storePromise: e.target.value })}
                      rows={2}
                      placeholder="Store's commitment and promise to customers"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isBulkModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#1A1A1A]">Bulk Add Products</h2>
          <button
            onClick={() => {
              setIsBulkModalOpen(false);
              setBulkRows([]);
              setBulkErrors([]);
            }}
            className="text-gray-500 hover:text-[#1A1A1A]"
          >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 text-sm">
                <p className="font-semibold mb-2">How to use</p>
                <p>Download the Excel template, fill it, and upload the .xlsx file.</p>
                <p className="mt-2">
                  Required columns only: <strong>name, price, originalPrice, stock, isActive, category, description</strong>
                </p>
                <p className="mt-1">
                  Optional column: <strong>weight</strong> (examples: <strong>100 ml</strong>, <strong>250 gm</strong>, <strong>2 pcs</strong>, <strong>1 stick</strong>).
                </p>
                <p className="mt-1">
                  Optional column: <strong>imageLink</strong> (single image URL). You can still use <strong>images</strong> for multiple URLs.
                </p>
                <p className="mt-1">
                  Weight format check is warning-only (it will not block upload).
                </p>
                <p className="mt-1">
                  Supported units: <strong>pcs, stick, ml, gm/gram</strong>. Values over <strong>1000 ml/gm</strong> auto-convert to <strong>l/kg</strong>.
                </p>
                <p className="mt-1">
                  Status uses <strong>isActive</strong> with values: <strong>true</strong> or <strong>false</strong>. If <strong>stock = 0</strong>, product is auto-set to <strong>inactive</strong>.
                </p>
                <p className="mt-1">
                  Downloaded template includes an <strong>isActive</strong> formula: <strong>IF(stock &lt;= 0, FALSE, TRUE)</strong>.
                </p>
                <p className="mt-1">
                  Category can be <strong>category id</strong>, <strong>slug</strong>, or <strong>name</strong>.
                </p>
                <p className="mt-1">
                  Conflict check uses <strong>product name + price</strong>. Same name with different price is treated as a different product.
                </p>
                <p className="mt-1">
                  The Excel template includes a category dropdown list that is updated from the database.
                </p>
                {categories.length > 0 && (
                  <p className="mt-1">
                    Available categories: <strong>{categories.map((c) => c.name).join(', ')}</strong>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Excel</label>
                  <input
                    type="file"
                    accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = async () => {
                        try {
                          const workbook = new ExcelJS.Workbook();
                          const buffer = reader.result as ArrayBuffer;
                          await workbook.xlsx.load(buffer);
                          const sheet = workbook.getWorksheet('Products') || workbook.worksheets[0];
                          if (!sheet) {
                            setBulkErrors(['No worksheet found in the Excel file.']);
                            setBulkRows([]);
                            return;
                          }
                          const rows: string[][] = [];
                          const getCellText = (v: any) => {
                            if (v === null || v === undefined) return '';
                            if (typeof v === 'object') {
                              if ('result' in v && v.result !== null && v.result !== undefined) {
                                return String(v.result);
                              }
                              if ('text' in v && v.text) {
                                return String(v.text);
                              }
                              if (Array.isArray((v as any).richText)) {
                                return (v as any).richText.map((r: any) => r?.text || '').join('');
                              }
                            }
                            return String(v);
                          };
                          sheet.eachRow((row, rowNumber) => {
                            const values = row.values as any[];
                            const cells = values.slice(1).map((v) => getCellText(v));
                            if (rowNumber === 1 || cells.some((c) => String(c).trim().length > 0)) {
                              rows.push(cells);
                            }
                          });

                          if (rows.length === 0) {
                            setBulkErrors(['No data found in the Excel file.']);
                            setBulkRows([]);
                            return;
                          }

                          const headers = rows[0].map((h) => String(h).trim());
                          const dataRows = rows.slice(1);
                          const text = [headers, ...dataRows].map((r) => r.join(',')).join('\n');
                          buildBulkRows(text);
                        } catch (err) {
                          setBulkErrors(['Failed to read Excel file.']);
                          setBulkRows([]);
                        }
                      };
                      reader.readAsArrayBuffer(file);
                    }}
                    className="w-full"
                  />
                  <button
                    type="button"
                    onClick={downloadBulkExcelTemplate}
                    className="btn-secondary mt-3"
                  >
                    Download Excel Template
                  </button>
                </div>
              </div>

              {bulkErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                  {bulkErrors.map((err, idx) => (
                    <p key={idx}>{err}</p>
                  ))}
                </div>
              )}

              {bulkRows.length > 0 && (
                <div className="bg-white border rounded-lg overflow-hidden">
                  <div className="px-4 py-3 border-b bg-gray-50 text-sm font-semibold text-gray-700">
                    Parsed Rows: {bulkRows.length}
                  </div>
                  <div className="px-4 py-2 border-b bg-white text-xs text-gray-700 flex flex-wrap gap-3">
                    <span className="px-2 py-1 rounded bg-green-100 text-green-800">OK</span>
                    <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">Duplicate name + stock changed</span>
                    <span className="px-2 py-1 rounded bg-amber-100 text-amber-800">Duplicate name</span>
                    <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800">Warning</span>
                    <span className="px-2 py-1 rounded bg-red-100 text-red-800">Error</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-3 py-2 text-left">#</th>
                          <th className="px-3 py-2 text-left">Name</th>
                          <th className="px-3 py-2 text-left">Category</th>
                          <th className="px-3 py-2 text-left">Price</th>
                          <th className="px-3 py-2 text-left">Stock</th>
                          <th className="px-3 py-2 text-left">Weight</th>
                          <th className="px-3 py-2 text-left">Status</th>
                          <th className="px-3 py-2 text-left">Duplicate</th>
                          <th className="px-3 py-2 text-left">Errors</th>
                          <th className="px-3 py-2 text-left">Warnings</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {bulkRows.map((row) => (
                          <tr key={row.index} className={getBulkRowColorClass(row)}>
                            <td className="px-3 py-2">{row.index}</td>
                            <td className="px-3 py-2">{row.submitData.name}</td>
                            <td className="px-3 py-2">{row.submitData.category || '-'}</td>
                            <td className="px-3 py-2">₹{row.submitData.price}</td>
                            <td className="px-3 py-2">{row.submitData.stock}</td>
                            <td className="px-3 py-2">{row.submitData?.attributes?.weight || '-'}</td>
                            <td className="px-3 py-2">{row.submitData.isActive ? 'Active' : 'Inactive'}</td>
                            <td className="px-3 py-2">
                              {row.isDuplicate ? (
                                <span className="text-amber-700">
                                  {row.duplicateSource === 'existing'
                                    ? row.stockChanged
                                      ? `Duplicate (stock ${row.existingStock} -> ${row.submitData.stock})`
                                      : 'Duplicate (same stock)'
                                    : 'Duplicate in upload'}
                                </span>
                              ) : (
                                <span className="text-green-600">OK</span>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              {row.errors.length > 0 ? (
                                <span className="text-red-600">{row.errors.join(', ')}</span>
                              ) : (
                                <span className="text-green-600">OK</span>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              {row.warnings?.length > 0 ? (
                                <span className="text-amber-700">{row.warnings.join(', ')}</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleBulkSubmit}
                  disabled={isBulkSubmitting}
                  className="btn-primary flex-1"
                >
                  {isBulkSubmitting ? 'Submitting...' : 'Create Products'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsBulkModalOpen(false);
                    setBulkRows([]);
                    setBulkErrors([]);
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isDeleteConfirmModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-[#1A1A1A]">Confirm Deletion</h3>
            </div>
            <div className="p-6 space-y-3">
              <p className="text-gray-700">
                {pendingDeleteIds.length === 1
                  ? 'Are you sure you want to delete this product?'
                  : `Are you sure you want to delete ${pendingDeleteIds.length} selected products?`}
              </p>
              <p className="text-sm text-red-600">
                This action cannot be undone.
              </p>
            </div>
            <div className="p-6 border-t flex gap-3">
              <button
                type="button"
                onClick={() => {
                  if (isDeletingProducts) return;
                  setIsDeleteConfirmModalOpen(false);
                  setPendingDeleteIds([]);
                }}
                disabled={isDeletingProducts}
                className="btn-secondary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeletingProducts}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeletingProducts ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
