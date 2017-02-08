var _ = require('lodash');

var rules = [
  //Inside each rule
  //'this.order' refers to the order
  //'this.catalog' refers to the catalog of objects
  //'this.services' refers to the available services

  {
    "name" : "BR1",
    // If the purchase order contains a membership,
    // it has to be activated in the customer account immediately
    "condition": function(R) {
      R.when(true);
    },
    "consequence": function(R) {
      _(this.order.basket)
      .filter(
        item =>
        item.type == "membership"
      ).map(
        item =>
        this.services.customer.activateMembership(
          this.order.customer, item.title)
        ).forEach(i => this.messages.push(i));
        R.next();
      }
    },
    {
      "name" : "BR2",
      // If the purchase order contains an upgrade, it has to be activated in the
      // customer account immediately.
      "condition": function(R) {
        R.when(true);
      },
      "consequence": function(R) {
        _(this.order.basket)
        .filter(
          item => item.type == "upgrade"
        ).map(item => this.services.customer.upgradeToPremium(
            this.order.customer)
          ).forEach(i => this.messages.push(i));
          R.next();
        }
      },
      {
        //       If the purchase order contains a physical product a shipping slip has to be
        // generated.
        "name" : "BR3",
        "condition": function(R) {
          R.when(true);
        },
        "consequence": function(R) {

          function isPhysical(item){
            return "book" === item.type;
          }

          var physicalItems = _(this.order.basket).filter(isPhysical);
          if (physicalItems.size() > 0){
            this.messages.push(this.services.shipping.generateShippingSlip(physicalItems));
          }

          R.next();
        }
      },
      {
        //       If the purchase order contains Comprehensive First Aid Training video then
        // Basic First Aid training video is added to the purchase order.
        "name" : "BR4",
        "condition": function(R) {
          R.when(
            this &&
            _.has(this.order.basket, 'comprehensive_first_aid_training') &&
            !_.has(this.order.basket, 'basic_first_aid_training')
          );
        },
        "consequence": function(R) {
          _.set(
            this.order.basket,
            'basic_first_aid_training',
            _.get(this.services.catalog, 'basic_first_aid_training')
          );
          R.next();
        }
      },
      {
        // If the purchase order has a referer partner then generate a commission
        // payment of 5% of the total price to the referer partner.
        "name" : "BR5",
        "condition" : function(R) {
          R.when(this.order.referer_partner);
        },
        "consequence" : function(R) {
          this.messages.push(
            this.services.partners.generateComissionPayment(
              this.order.referer_partner,
              this.order.total,
              1)
            );
            R.next();
          }
        }
      ];

      module.exports = rules;
