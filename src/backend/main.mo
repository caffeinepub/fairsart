import Map "mo:core/Map";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public type UserProfile = {
    name : Text;
  };

  type Product = {
    id : Text;
    name : Text;
    price : Nat;
    description : Text;
    image : Storage.ExternalBlob;
  };

  type CartItem = {
    productId : Text;
    quantity : Nat;
  };

  type Order = {
    id : Text;
    userId : Principal;
    customerName : Text;
    customerEmail : Text;
    shippingAddress : Text;
    items : [CartItem];
    total : Nat;
    timestamp : Time.Time;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let products = Map.empty<Text, Product>();
  let carts = Map.empty<Principal, [CartItem]>();
  let orders = Map.empty<Text, Order>();

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Product Management (Admin only)
  public shared ({ caller }) func addProduct(name : Text, price : Nat, description : Text, image : Storage.ExternalBlob) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };
    let id = name.concat(Time.now().toText());
    let product : Product = {
      id;
      name;
      price;
      description;
      image;
    };
    products.add(id, product);
    id;
  };

  public shared ({ caller }) func updateProduct(id : Text, name : Text, price : Nat, description : Text, image : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) {
        let product : Product = {
          id;
          name;
          price;
          description;
          image;
        };
        products.add(id, product);
      };
    };
  };

  public shared ({ caller }) func deleteProduct(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };
    products.remove(id);
  };

  // Product Viewing (Public - no auth required, guests can view)
  public query func getAllProducts() : async [Product] {
    products.values().toArray();
  };

  public query func getProduct(id : Text) : async Product {
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  // Shopping Cart (User must be authenticated and can only access their own cart)
  public shared ({ caller }) func addToCart(productId : Text, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add to cart");
    };

    let cart = switch (carts.get(caller)) {
      case (null) { [] };
      case (?items) { items };
    };

    let updatedCart = cart.filter(
      func(item) {
        item.productId != productId;
      }
    ).concat([{ productId; quantity }]);

    carts.add(caller, updatedCart);
  };

  public shared ({ caller }) func removeFromCart(productId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove from cart");
    };

    let cart = switch (carts.get(caller)) {
      case (null) { Runtime.trap("Cart not found") };
      case (?items) { items };
    };

    let updatedCart = cart.filter(
      func(item) {
        item.productId != productId;
      }
    );

    carts.add(caller, updatedCart);
  };

  public shared ({ caller }) func clearCart() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear cart");
    };
    carts.remove(caller);
  };

  public query ({ caller }) func getCart() : async [CartItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cart");
    };
    switch (carts.get(caller)) {
      case (null) { [] };
      case (?items) { items };
    };
  };

  // Checkout and Orders (User must be authenticated and can only checkout their own cart)
  public shared ({ caller }) func checkout(customerName : Text, customerEmail : Text, shippingAddress : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can checkout");
    };

    let cart = switch (carts.get(caller)) {
      case (null) { Runtime.trap("Cart not found") };
      case (?items) { items };
    };

    if (cart.size() == 0) {
      Runtime.trap("Cart is empty");
    };

    var total = 0;
    for (item in cart.values()) {
      switch (products.get(item.productId)) {
        case (null) { Runtime.trap("Product not found") };
        case (?product) {
          total += product.price * item.quantity;
        };
      };
    };

    let orderId = caller.toText().concat(Time.now().toText());
    let order : Order = {
      id = orderId;
      userId = caller;
      customerName;
      customerEmail;
      shippingAddress;
      items = cart;
      total;
      timestamp = Time.now();
    };

    orders.add(orderId, order);
    carts.remove(caller);
    orderId;
  };

  // Order viewing (User can only view their own orders, admins can view all)
  public query ({ caller }) func getOrder(orderId : Text) : async Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };

    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        if (order.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
        order;
      };
    };
  };

  // Admin function to view all orders
  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray();
  };

  // User function to view their own orders
  public query ({ caller }) func getMyOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };
    orders.values().filter(func(order) { order.userId == caller }).toArray();
  };
};
