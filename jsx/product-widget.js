
var ProductWidget = React.createClass({
    propTypes:
    {
        productNo:React.PropTypes.number,
        variantNo: React.PropTypes.number,
        parentNo: React.PropTypes.number,
        quantity: React.PropTypes.number,
        type: React.PropTypes.string,
        callBack: React.PropTypes.func
    },
    getInitialState: function(){
        return {
            product: {
                name: '',
                price: 0,
                imageList:[],
                optionList:[],
                variantList:[]
            },
            selectedOptionList:[],
            selectedVariantList:[],
            reason: ''
        }
    },
    componentDidMount: function() {
        this.serverRequest = $.get('/api/products/' + this.props.productNo, function (response) {
            if (response.error_code == '1000') {
                console.log('response: %O', response);

                var selectedOptionList = [];
                 response.product.optionList.forEach(function(option){
                    selectedOptionList.push({no: option.no, value: ''});
                 });

                response.product.variantList.forEach(function(variant){
                    variant.selectedQuantity = 1;
                });

                var selectedVariantList = [];
                if (this.props.type == 'NORMAL' || this.props.type == 'ADD') {
                    if (response.product.optionList.length == 0) {
                        selectedVariantList = [{no: 0, option1: 'Үндсэн сонголт', stockTrack: response.product.stockTrack, quantity: response.product.quantity, price:response.product.price, selectedQuantity: 1}];
                    }
                } else if (this.props.type == 'REFUND' || this.props.type == 'CHANGE') {
                    if (response.product.optionList.length == 0) {
                        selectedVariantList = [{no: 0, option1: 'Үндсэн сонголт', stockTrack: response.product.stockTrack, quantity: this.props.quantity, parentNo: this.props.parentNo, selectedQuantity: this.props.quantity}];
                    } else {
                        var selectedVariant = null;
                        response.product.variantList.forEach(function(variant){
                            if (variant.no == this.props.variantNo) {
                                selectedVariant = variant;
                            }
                        }.bind(this));

                        if (selectedVariant) {
                            selectedVariant.parentNo = this.props.parentNo;
                            selectedVariant.quantity = this.props.quantity;
                            selectedVariant.selectedQuantity = this.props.quantity;
                        }

                        selectedVariantList = [selectedVariant];
                    }
                }


                 console.log('selectedOptionList %O', selectedOptionList);

                this.setState({
                    product: response.product,
                    selectedOptionList: selectedOptionList,
                    selectedVariantList: selectedVariantList
                });
            } else {

            }

        }.bind(this));
    },
    componentWillUnmount: function() {
        this.serverRequest.abort();
    },

    renderOptionList: function() {
        console.log(this.state.product.optionList);
        var _this = this;
        if (this.props.type == 'NORMAL' || this.props.type == 'ADD') {
            return (
                <div className="form">

                {
                  this.state.product.optionList.map(function (option, index) {
                      return (
                          <div key={option.no} className="form-group">
                              <label>{option.name}</label>
                              <div className="mm-select-wrapper">
                              <select className="form-control" ref="option" value={this.state.selectedOptionList[index].value} onChange={this.handleOptionChange.bind(_this, option.no)} >
                                  <option value="" >Сонголт</option>
                                    {
                                        option.valueList.map(function (value) {
                                            return (<option key={value} value={value}>{value}</option>);
                                        })
                                        }
                              </select>
                              </div>
                          </div>
                      )
                  }.bind(this))
                  }

                </div>


            );
        } else {
            return (<div className="form"></div>);
        }

    },

    renderVariantList: function() {
        var _this = this;
        var optionLength = this.state.selectedOptionList.length;
        var variantList = this.state.selectedVariantList.map(function (variant, index) {
            var variantName = variant.option1;
            if (optionLength > 1) {
                variantName = variantName + '/' + variant.option2;
            }
            if (optionLength > 2) {
                variantName = variantName + '/' + variant.option3;
            }

            var buttonStyle = {display: 'block'};
            if (variant.no == 0) {
                buttonStyle.display = 'none';
            }

            if (this.props.type == 'REFUND' || this.props.type == 'CHANGE') {
                buttonStyle.display = 'none';
            }

            var maxQuantity = variant.quantity;
            if (this.props.type == 'NORMAL' || this.props.type == 'ADD') {
                if (!variant.stockTrack) {
                    maxQuantity = 100;
                }
            }
            if (this.props.type == 'REFUND' || this.props.type == 'CHANGE') {
                maxQuantity = variant.quantity;
            }

            return (
                <div className="form-group" key={variant.no}>
                    <label className="col-sm-6 control-label product-variant-name">{variantName}</label>
                    <div className="col-sm-3">
                        <NumberPicker value={variant.selectedQuantity} onChange={this.handleQuantityChange.bind(_this, variant.no)} min="1" max={maxQuantity} />
                    </div>
                    <div className="col-sm-3" style={buttonStyle}>
                        <button type="button" className="btn btn-sm btn-default" onClick={this.handleRemoveVariant.bind(_this, variant.no)}><i className="fa fa-trash"></i></button>
                    </div>
                </div>
            )
        }.bind(this));

        return (
            <div className="form-horizontal">
            {variantList}
            </div>
        );
    },

    handleRemoveVariant: function(variantNo) {
        var selectedIndex = -1;
        this.state.selectedVariantList.forEach(function(variant, index){
            if (variant.no == variantNo) {
                selectedIndex = index;
            }
        });

        var variantUpdates = {$splice: [[selectedIndex, 1]]};

        this.setState({
            selectedVariantList : React.addons.update(this.state.selectedVariantList, variantUpdates)
        })
    },

    handleOptionChange: function(optionNo, event){
        /*console.log(arguments);*/
        var value = event.target.value;
        console.log('value: ', value);

        var selectedOptionList = this.state.selectedOptionList;

        selectedOptionList.forEach(function(item){
            if (item.no == optionNo) {
                item.value = value;
            }
        });

        var allSet = true;
        selectedOptionList.forEach(function(item){
            if (item.value == '') {
                allSet = false;
            }
        });

        this.setState({
            selectedOptionList: selectedOptionList
        });

        if (allSet) {
            var selectedVariant = null;

            this.state.product.variantList.forEach(function(variant, index){
                if (selectedOptionList.length == 1 && variant.option1 == selectedOptionList[0].value) {
                    selectedVariant = variant;
                }
                if (selectedOptionList.length == 2 && variant.option1 == selectedOptionList[0].value &&
                    variant.option2 == selectedOptionList[1].value) {
                    selectedVariant = variant;
                }
                if (selectedOptionList.length == 3 && variant.option1 == selectedOptionList[0].value &&
                    variant.option2 == selectedOptionList[1].value && variant.option3 == selectedOptionList[2].value) {
                    selectedVariant = variant;
                }
            });

            if (selectedVariant) {

                selectedOptionList.forEach(function(item){
                    item.value = '';
                });

                this.setState({
                    selectedOptionList: selectedOptionList
                });

                this.addVariant(selectedVariant);
            }
        }

        //add variant
        /*var variant = this.state.product.variantList[1];
         this.addVariant(variant);*/
    },

    handleQuantityChange: function(variantNo, quantity){
        var value = quantity;

        console.log('variantNo: %O, value: %O', variantNo, value);

        var selectedVariantList = this.state.selectedVariantList;
        selectedVariantList.forEach(function(variant){
           if (variant.no == variantNo) {
               variant.selectedQuantity = value;
           }
        });

        console.log('selectedVariantList:%O', selectedVariantList);

        this.setState({
            selectedVariantList: selectedVariantList
        });
    },

    handleAdd: function() {
        //submit form
        //event.preventDefault();

        console.log('handleAdd:' + this.props.type);

        if (this.props.type == 'REFUND' || this.props.type  == 'CHANGE') {
            if (!this.state.reason) {
                alert('Буцаах/солих шалтгаан заавал сонгоно уу');
                return;
            }

            this.props.callBack(this.props.productNo, this.state.product.name, this.state.selectedVariantList, this.props.type, this.state.reason);
        } else {
            this.props.callBack(this.props.productNo, this.state.product.name, this.state.selectedVariantList, this.props.type);
        }
    },

    addVariant: function(variant){
        this.setState({
            selectedVariantList: this.state.selectedVariantList.concat([variant])
        });
    },

    handleReasonChange: function(event) {
        var value = event.target.value;

        this.setState({reason: value});
    },

    render: function(){
        var productImageUrl = '';

        this.state.product.imageList.forEach(function(image){
            if (image.type == 'intro') {
                productImageUrl = image.url;
            }
        });

        var buttonName = 'Нэмэх';
        if (this.props.type == 'REFUND') {
            buttonName = 'Буцаах';
        }
        if (this.props.type == 'CHANGE') {
            buttonName = 'Солих';
        }

        var priceStr = this.state.product.price + '₮';

        if (this.state.product.comparePrice) {
            priceStr = this.state.product.comparePrice + '₮ -> ' + (this.state.product.price) + '₮';
        }

        var reasonStyle = {display: 'none'};
        if (this.props.type == 'REFUND' || this.props.type == 'CHANGE') {
            reasonStyle = {display: 'block'};
        }

        return (
            <div className="mm-product-widget">
                <div className="form-group" style={reasonStyle}>
                    <label>Буцаах/солих шалтгаах</label>
                    <div className="mm-select-wrapper">
                        <select className="form-control" ref="reason" value={this.state.reason} onChange={this.handleReasonChange} >
                            <option value="" >Сонголт</option>
                            <option value="PRODUCT_DEFECT" >Бараа асуудалтай</option>
                            <option value="SENT_OTHER_PRODUCT" >Буруу бараа илгээсэн</option>
                            <option value="SIZE_PROBLEM" >Хэмжээ таараагүй</option>
                            <option value="NOT_LIKE" >Бараа таалагдаагүй</option>
                        </select>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <h5>{this.state.product.name}</h5>
                    </div>
                </div>


                <div className="row">
                    <div className="col-sm-3">
                        <img src={productImageUrl} width="100%"/>
                    </div>
                    <div className="col-sm-9">
                        <p>{priceStr}</p>
                        {this.renderOptionList()}

                        {this.renderVariantList()}
                    </div>
                </div>

                <div className="row">
                    <div className="col-sm-12 text-center">
                        <button type="button" className="btn btn-primary" onClick={this.handleAdd}>{buttonName}</button>
                    </div>
                </div>
            </div>

        );
    }

});
