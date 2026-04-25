'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const serviceCatalogSchema = new Schema(
  {
    serviceKey: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    serviceName: {
      type: String,
      trim: true,
      default: '',
    },
    provider: {
      type: String,
      default: 'vtpass',
      trim: true,
      index: true,
    },
    providerCode: {
      type: String,
      trim: true,
      default: '',
    },
    serviceId: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    variationCode: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    supportsDynamicAmount: {
      type: Boolean,
      default: false,
    },
    pricingMode: {
      type: String,
      enum: ['fixed', 'markup'],
      default: 'fixed',
      index: true,
    },
    costPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    sellingPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    resellerPriceMarkup: {
      type: Number,
      default: 5,
      min: 0,
    },
    usePercentageMarkup: {
      type: Boolean,
      default: false,
    },
    resellerTierMarkups: {
      bronze: {
        type: Number,
        default: 7,
        min: 0,
      },
      silver: {
        type: Number,
        default: 5,
        min: 0,
      },
      gold: {
        type: Number,
        default: 3,
        min: 0,
      },
    },
    currency: {
      type: String,
      default: 'NGN',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['live', 'draft', 'paused'],
      default: 'live',
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

serviceCatalogSchema.virtual('profitMargin').get(function profitMargin() {
  return Number(this.sellingPrice || 0) - Number(this.costPrice || 0);
});

serviceCatalogSchema.virtual('marginRate').get(function marginRate() {
  const costPrice = Number(this.costPrice || 0);
  if (costPrice <= 0) {
    return 0;
  }
  return (Number(this.sellingPrice || 0) - costPrice) / costPrice;
});

serviceCatalogSchema.set('toJSON', { virtuals: true });
serviceCatalogSchema.set('toObject', { virtuals: true });

serviceCatalogSchema.index(
  {
    serviceKey: 1,
    provider: 1,
    serviceId: 1,
    variationCode: 1,
  },
  { unique: true }
);

module.exports = mongoose.model('ServiceCatalog', serviceCatalogSchema);
