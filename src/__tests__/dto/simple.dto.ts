// Simple DTOs for testing without decorators
export class SimpleCreateProductDto {
    title: string;
    price: number;
    discount?: number;

    constructor(data?: any) {
        if (data) {
            this.title = data.title;
            this.price = data.price;
            this.discount = data.discount;
        }
    }
}

export class SimpleUpdateProductDto {
    title?: string;
    price?: number;
    discount?: number;

    constructor(data?: any) {
        if (data) {
            if (data.title !== undefined) this.title = data.title;
            if (data.price !== undefined) this.price = data.price;
            if (data.discount !== undefined) this.discount = data.discount;
        }
    }
}
