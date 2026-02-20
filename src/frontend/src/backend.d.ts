import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface CartItem {
    productId: string;
    quantity: bigint;
}
export interface Order {
    id: string;
    customerName: string;
    total: bigint;
    userId: Principal;
    timestamp: Time;
    shippingAddress: string;
    items: Array<CartItem>;
    customerEmail: string;
}
export interface UserProfile {
    name: string;
}
export interface Product {
    id: string;
    name: string;
    description: string;
    image: ExternalBlob;
    price: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(name: string, price: bigint, description: string, image: ExternalBlob): Promise<string>;
    addToCart(productId: string, quantity: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkout(customerName: string, customerEmail: string, shippingAddress: string): Promise<string>;
    clearCart(): Promise<void>;
    deleteProduct(id: string): Promise<void>;
    getAllOrders(): Promise<Array<Order>>;
    getAllProducts(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Array<CartItem>>;
    getMyOrders(): Promise<Array<Order>>;
    getOrder(orderId: string): Promise<Order>;
    getProduct(id: string): Promise<Product>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    removeFromCart(productId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateProduct(id: string, name: string, price: bigint, description: string, image: ExternalBlob): Promise<void>;
}
