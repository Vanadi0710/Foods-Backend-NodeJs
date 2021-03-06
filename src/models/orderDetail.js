'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderDetails extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      OrderDetails.belongsTo(models.Order)
      OrderDetails.belongsTo(models.Product)
      OrderDetails.belongsTo(models.CustomerInfo)
    }
  };
  OrderDetails.init({
    id:{
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
  },
    orderId: DataTypes.INTEGER,
    productId: DataTypes.INTEGER,
    quantityOrdered: DataTypes.INTEGER,
    priceEach: DataTypes.INTEGER,
    customerInfoId: DataTypes.INTEGER
    
  }, {
    sequelize,
    modelName: 'OrderDetails',
  });
  return OrderDetails;
};