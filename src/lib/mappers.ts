import { Category, Order, Product } from '../types';

const getId = (value: any) => value?._id || value?.id || value?.slug || '';

export function mapCategory(payload: any): Category {
    return {
        id: getId(payload),
        name: payload?.name || 'Untitled',
        slug: payload?.slug || payload?.id,
        description: payload?.description,
        image_url: payload?.image_url || payload?.image,
        image: payload?.image,
        parent_id: getId(payload?.parent) || payload?.parent_id || null,
        parent: payload?.parent,
        is_active: payload?.is_active ?? payload?.isActive ?? true,
        isActive: payload?.isActive ?? payload?.is_active ?? true,
        created_at: payload?.created_at,
        createdAt: payload?.createdAt,
    };
}

export function mapProduct(payload: any): Product {
    const id = getId(payload);
    return {
        id,
        _id: payload?._id,
        name: payload?.name || 'Untitled Product',
        slug: payload?.slug || id,
        description: payload?.description,
        short_description: payload?.short_description,
        price: Number(payload?.price) || 0,
        compare_at_price: payload?.compare_at_price ?? payload?.originalPrice ?? null,
        originalPrice: payload?.originalPrice,
        category_id: getId(payload?.category) || payload?.category_id || null,
        category: payload?.category,
        image_url: payload?.image_url || payload?.images?.[0],
        images: payload?.images || (payload?.image_url ? [payload.image_url] : []),
        stock_quantity: payload?.stock_quantity ?? payload?.stock ?? 0,
        stock: payload?.stock,
        low_stock_threshold: payload?.low_stock_threshold ?? 5,
        featured: payload?.featured,
        is_featured: payload?.is_featured ?? payload?.featured ?? false,
        is_bestseller: payload?.is_bestseller ?? payload?.isBestseller ?? false,
        is_active: payload?.is_active ?? payload?.isActive ?? true,
        isActive: payload?.isActive ?? payload?.is_active ?? true,
        deity: payload?.deity,
        attributes: payload?.attributes ?? payload?.specifications ?? {},
        created_at: payload?.created_at,
        updated_at: payload?.updated_at,
        createdAt: payload?.createdAt,
        updatedAt: payload?.updatedAt,
    };
}

export function mapOrder(payload: any): Order {
    return {
        id: getId(payload),
        user: getId(payload?.user) || null,
        order_number: payload?.order_number,
        status: payload?.status ?? payload?.orderStatus,
        orderStatus: payload?.orderStatus ?? payload?.status,
        subtotal: Number(payload?.subtotal) || 0,
        discount: Number(payload?.discount) || 0,
        shipping_cost: Number(payload?.shipping_cost ?? payload?.shippingCost) || 0,
        shippingCost: Number(payload?.shippingCost ?? payload?.shipping_cost) || 0,
        tax: Number(payload?.tax) || 0,
        total: Number(payload?.total) || 0,
        items: payload?.items,
        shipping_address: payload?.shipping_address ?? payload?.shippingAddress,
        shippingAddress: payload?.shippingAddress ?? payload?.shipping_address,
        payment_method: payload?.payment_method ?? payload?.paymentMethod,
        paymentMethod: payload?.paymentMethod ?? payload?.payment_method,
        payment_status: payload?.payment_status ?? payload?.paymentStatus,
        paymentStatus: payload?.paymentStatus ?? payload?.payment_status,
        invoiceNumber: payload?.invoiceNumber,
        tracking_id: payload?.tracking_id,
        notes: payload?.notes,
        orderTimeline: payload?.orderTimeline ?? [],
        created_at: payload?.created_at,
        updated_at: payload?.updated_at,
        createdAt: payload?.createdAt,
        updatedAt: payload?.updatedAt,
    };
}
