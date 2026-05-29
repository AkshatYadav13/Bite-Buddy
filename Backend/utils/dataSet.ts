export const GST_RATE = 0.18;

export const priceChart = [
  { minOrders: 0, maxOrders: 9, priceAdjustment: 10 },
  { minOrders: 10, maxOrders: 49, priceAdjustment: 20 },
  { minOrders: 50, maxOrders: 99, priceAdjustment: 30 },
  { minOrders: 100, maxOrders: 199, priceAdjustment: 40 },
  { minOrders: 200, maxOrders: null, priceAdjustment: 50 },
];

// STATS
const restaurantStats = {
  profile: {
    name: "Spice Garden Restaurant",
    owner: {
      name: "Rajesh Kumar",
      email: "rajesh@spicegarden.com",
      phone: "+91 98765 43210",
    },
    location: {
      address: "123 MG Road, Hazratganj",
      area: "Hazratganj",
      city: "Lucknow",
      state: "Uttar Pradesh",
      pincode: "226001",
    },
    cuisineTypes: ["North Indian", "Chinese", "Continental", "Mughlai"],
    status: "Open",
    avgRating: 4.3,
    totalReviews: 1247,
    totalDishes: 89,
    createdAt: "2023-01-15",
    isVerified: true,
    banner: "/api/restaurant-banner.jpg",
  },

  earnings: {
    today: 12450,
    thisWeek: 87340,
    thisMonth: 345670,
    total: 2134500,
    weeklyEarnings: [
      { day: "Mon", earnings: 8450 },
      { day: "Tue", earnings: 12300 },
      { day: "Wed", earnings: 15670 },
      { day: "Thu", earnings: 11200 },
      { day: "Fri", earnings: 18900 },
      { day: "Sat", earnings: 14500 },
      { day: "Sun", earnings: 6320 },
    ],
    monthlyTrend: [
      { month: "Jan", earnings: 298000 },
      { month: "Feb", earnings: 312000 },
      { month: "Mar", earnings: 287000 },
      { month: "Apr", earnings: 334000 },
      { month: "May", earnings: 356000 },
      { month: "Jun", earnings: 345670 },
    ],
  },

  orderStats: {
    totalOrders: 3456,
    deliveredOrders: 3234,
    canceledOrders: 134,
    pendingOrders: 88,
    avgOrderValue: 450,
    topDishes: [
      { name: "Butter Chicken", orders: 456, revenue: 182400 },
      { name: "Biryani Special", orders: 398, revenue: 199000 },
      { name: "Paneer Tikka", orders: 334, revenue: 133600 },
      { name: "Dal Makhani", orders: 287, revenue: 86100 },
      { name: "Garlic Naan", orders: 234, revenue: 23400 },
    ],
    recentOrders: [
      {
        id: "ORD001",
        customer: "Amit S.",
        items: 3,
        amount: 650,
        status: "Delivered",
        time: "2 hours ago",
      },
      {
        id: "ORD002",
        customer: "Priya M.",
        items: 2,
        amount: 420,
        status: "Preparing",
        time: "15 min ago",
      },
      {
        id: "ORD003",
        customer: "Rohit K.",
        items: 4,
        amount: 890,
        status: "Confirmed",
        time: "5 min ago",
      },
      {
        id: "ORD004",
        customer: "Sneha R.",
        items: 1,
        amount: 280,
        status: "Delivered",
        time: "1 hour ago",
      },
    ],
    ordersByHour: [
      { hour: "9AM", orders: 5 },
      { hour: "10AM", orders: 12 },
      { hour: "11AM", orders: 18 },
      { hour: "12PM", orders: 45 },
      { hour: "1PM", orders: 67 },
      { hour: "2PM", orders: 52 },
      { hour: "3PM", orders: 23 },
      { hour: "4PM", orders: 15 },
      { hour: "5PM", orders: 8 },
      { hour: "6PM", orders: 12 },
      { hour: "7PM", orders: 38 },
      { hour: "8PM", orders: 72 },
      { hour: "9PM", orders: 89 },
      { hour: "10PM", orders: 56 },
      { hour: "11PM", orders: 34 },
    ],
  },

  ratings: {
    avgRating: 4.3,
    totalRatings: 1247,
    distribution: [
      { rating: 5, count: 634, percentage: 50.8 },
      { rating: 4, count: 387, percentage: 31.0 },
      { rating: 3, count: 162, percentage: 13.0 },
      { rating: 2, count: 49, percentage: 3.9 },
      { rating: 1, count: 15, percentage: 1.2 },
    ],
  },

  dishPerformance: {
    totalDishes: 89,
    availableDishes: 82,
    topRatedDishes: [
      { name: "Special Biryani", rating: 4.8, orders: 398, revenue: 199000 },
      { name: "Butter Chicken", rating: 4.7, orders: 456, revenue: 182400 },
      { name: "Paneer Tikka", rating: 4.6, orders: 334, revenue: 133600 },
      { name: "Dal Makhani", rating: 4.5, orders: 287, revenue: 86100 },
      { name: "Garlic Naan", rating: 4.4, orders: 234, revenue: 23400 },
    ],
    leastPerforming: [
      { name: "Fish Curry", rating: 3.2, orders: 12, revenue: 4800 },
      { name: "Mutton Korma", rating: 3.4, orders: 18, revenue: 9000 },
      { name: "Veg Manchurian", rating: 3.6, orders: 24, revenue: 7200 },
    ],
    categoryWise: [
      { category: "Main Course", dishes: 35, orders: 1234, revenue: 567800 },
      { category: "Appetizers", dishes: 18, orders: 567, revenue: 113400 },
      { category: "Desserts", dishes: 12, orders: 234, revenue: 35100 },
      { category: "Beverages", dishes: 15, orders: 345, revenue: 20700 },
      { category: "Breads", dishes: 9, orders: 456, revenue: 45600 },
    ],
  },
};

const agentStats = {
  weeklyEarnings:[
    { day: 'Mon', earnings: 720 },
    { day: 'Tue', earnings: 890 },
    { day: 'Wed', earnings: 650 },
    { day: 'Thu', earnings: 920 },
    { day: 'Fri', earnings: 780 },
    { day: 'Sat', earnings: 1100 },
    { day: 'Sun', earnings: 850 }
  ],
  ratingDistribution:[
    { rating: 5, count: 58 },
    { rating: 4, count: 28 },
    { rating: 3, count: 8 },
    { rating: 2, count: 2 },
    { rating: 1, count: 0 }
  ]
}

const adminStats = {
  users: {
    total: 15847,
    activeLast30Days: 8234,
    roles: {
      customer: 12450,
      restaurant_owner: 2847,
      delivery_agent: 550
    }
  },
  orders: {
    total: 45623,
    status: {
      delivered: 38902,
      confirmed: 2341,
      preparing: 1876,
      out_for_delivery: 1504,
      pending: 1000
    },
    monthlyTrend: [
      { _id: { year: 2025, month: 6 }, count: 4234 },
      { _id: { year: 2025, month: 5 }, count: 3987 },
      { _id: { year: 2025, month: 4 }, count: 4156 },
      { _id: { year: 2025, month: 3 }, count: 3876 },
      { _id: { year: 2025, month: 2 }, count: 3654 },
      { _id: { year: 2025, month: 1 }, count: 3421 }
    ],
    revenue: 2847563,
    shippingRevenue: 284756,
    gstCollected: 341708,
    costOfGoods: 1982450,
    profit: 865113,
    grossMargin: 30.38
  },
  restaurants: {
    total: 2847,
    avgRating: 4.2,
    topRated: [
      { restaurantName: "Spice Garden", ratingTotal: 4.8 },
      { restaurantName: "Pizza Palace", ratingTotal: 4.7 },
      { restaurantName: "Burger Hub", ratingTotal: 4.6 },
      { restaurantName: "Taco Bell", ratingTotal: 4.5 },
      { restaurantName: "Sushi Master", ratingTotal: 4.4 }
    ]
  },
  dishes: {
    total: 18934
  },
  restaurantApplications: {
    total: 234,
    status: {
      pending: 89,
      approved: 124,
      rejected: 21
    }
  },
  deliveryAgentApplications: {
    total: 156,
    status: {
      pending: 45,
      approved: 98,
      rejected: 13
    }
  },
  deliveryAgents: {
    total: 550,
    online: 234,
    avgRating: 4.1
  }
};
