var PaymentModal = React.createClass({
    getInitialState: function () {
        return {
            paymentType: 'cash',
            cashReceived: this.props.total,
            cashReturn: 0
        };
    },
    componentDidMount: function(){

        /*setTimeout(function() {
         console.log('focus on did mount!!!: %o', this.cashReceivedInput );
         this.cashReceivedInput.focus();
         }.bind(this), 400);*/

        this.cashReceivedInput.focus();

    },
    componentDidUpdate: function(){
        console.log('focus on did update');
        this.cashReceivedInput.focus();
    },
    changeToCash: function() {
        this.setState({
            paymentType: 'cash'
        });
    },
    changeToCard: function() {
        this.setState({
            paymentType: 'card'
        });
    },
    handleTextChange: function() {
        var cashReceived = parseInt(this.cashReceivedInput.value);
        if (isNaN(cashReceived)) {
            cashReceived = 0;
        }
        var cashReturn = this.props.total - cashReceived;

        this.setState({
            cashReceived: cashReceived,
            cashReturn: cashReturn
        });

    },
    handleKeyDown: function(event) {
        if (event.keyCode == 13) {
            event.preventDefault();

            this.printReceipt();
        }

    },
    handleFocus: function(){
        console.log('has focus');
    },
    printReceipt: function() {
        var orderData = {
            cashReceived: this.state.cashReceived,
            cashReturn: this.state.cashReturn,
            variantList: this.props.variantList
        };


        $.ajax({
            url: 'http://dev.merchant.jurur.mn/api/order/createPosOrder',
            dataType: 'json',
            method: 'POST',
            cache: false,
            data: JSON.stringify(orderData),
            processData: false,
            contentType: 'application/json',
            success: function(data) {
                if (data.error_code == 1000) {
                    var url = '/pos/printReceipt?orderNo=' + data.orderNo;

                    console.log('url:' + url);

                    var iframe = $('<iframe src="' + url + '" width="0" height="0" frameborder="0" id="printReceiptIframe" name="printReceiptIframe" />');

                    iframe.on('load', function(){
                        window.frames['printReceiptIframe'].focus();
                        window.frames['printReceiptIframe'].print();
                    });

                    $('#printIframeWrapper').html(iframe);

                    this.props.callBack();
                } else {
                    alert(data.message);
                    console.error('error:%O', data);
                }

            }.bind(this),
            error: function(xhr, status, err) {
                alert('серветэй холбогдоход алдаа гарлаа');
                console.error(url, status, err.toString());

            }.bind(this)
        });

        $('#paymentModal').modal('hide');

        var container = $('#paymentModal .modal-body')[0];
        ReactDOM.unmountComponentAtNode(container);
    },
    render: function(){
        var cashBtnClass = 'btn btn-default btn-lg';
        var cardBtnClass = 'btn btn-default btn-lg';

        if (this.state.paymentType == 'cash') {
            cashBtnClass = 'btn btn-success btn-lg';
        }

        if (this.state.paymentType == 'card') {
            cardBtnClass = 'btn btn-success btn-lg';
        }


        return (
            <div>
                <div className="row">
                    <div className="form-group col-xs-6">
                        <label>Төлбөрийн төрөл</label>

                        <div className="btn-group">
                            <button type="button" className={cashBtnClass} onClick={this.changeToCash} ><i className="fa fa-money"></i> Бэлэн</button>
                            <button type="button" className={cardBtnClass} onClick={this.changeToCard}><i className="fa fa-credit-card"></i> Карт</button>
                        </div>
                    </div>

                    <div className="form-group col-xs-6">
                        <label>Төлөх дүн</label>
                        <p className="form-control-static text-lg" >{this.props.total}₮</p>
                    </div>
                </div>
                <div className="row">
                    <div className="form-group col-xs-6">
                        <label>Бэлэн авсан</label>

                        <input type="text" className="form-control" value={this.state.cashReceived} tabindex="-2"
                            ref={function(input){this.cashReceivedInput = input;}.bind(this)}
                            onChange={this.handleTextChange}
                            onKeyDown={this.handleKeyDown}
                            autoFocus
                            onFocus={this.handleFocus} />
                    </div>

                    <div className="form-group col-xs-6">
                        <label>Хариулт</label>

                        <p className="form-control-static" >{this.state.cashReturn}₮</p>
                    </div>

                </div>
                <div className="row">
                    <div className="form-group text-center">
                        <button type="button" className="btn btn-primary" onClick={this.printReceipt}>Баримт хэвлэх</button>
                    </div>
                </div>
            </div>
        );
    }
});

var CounterItem = React.createClass({
    clickHandler: function(){
        this.props.clickCallback(this.props.item);
    },
    render: function(){
        var subPrice = numeral(this.props.item.price * this.props.item.selectedQuantity).format('0,0');
        var className = "counter-item";
        if (this.props.isSelected) {
            className="counter-item active";
        }
        return (
            <div className={className} onClick={this.clickHandler}>
                <div className="counter-item-name"><span>{this.props.item.productName}</span></div>
                <div className="counter-item-qty">{this.props.item.selectedQuantity}ш</div>
                <div className="counter-item-price">{subPrice}₮</div>
            </div>
        );
    }
});

var CounterItemList = React.createClass({
    getInitialState: function(){
        return {
            selectedIndex: -1,
            quantityEditReset: true
        };
    },
    componentWillReceiveProps: function(nextProps) {
        var selectedIndex = this.state.selectedIndex;

        if (nextProps.itemList.length == 0) {
            selectedIndex = -1;

            this.setState({selectedIndex: selectedIndex});
        } else {
            if (selectedIndex >= nextProps.itemList.length) {
                selectedIndex = nextProps.itemList.length - 1;

                this.setState({selectedIndex: selectedIndex});
            }
        }
    },
    componentDidMount: function() {
        console.log('key handler set up');
        window.addEventListener('keydown', this.handleCounterKey);
    },
    componentWillUnmount: function() {
        window.removeEventListener('keydown', this.handleCounterKey);
    },
    handleCounterKey: function(event) {
        if (event.keyCode == 112) {//F1
            event.preventDefault();

            console.log('F1');

            this.setState({selectedIndex: 0, quantityEditReset: true});
            this.rootDiv.focus();

            return;
        }

        if (event.keyCode == 121) {//F10
            event.preventDefault();

            console.log('F10');

            this.setState({selectedIndex: -1, quantityEditReset: true});

            this.handlePayBtn();

            return;
        }
    },
    handleKeyDown: function(event) {
        if (event.keyCode == 27) {//esc
            event.preventDefault();

            this.setState({selectedIndex: -1, quantityEditReset: true});

            return;
        }

        if (event.keyCode == 40) {// down key
            event.preventDefault();

            if (this.props.itemList.length > 0) {
                var targetIndex = this.state.selectedIndex + 1;

                if (targetIndex >= this.props.itemList.length) {
                    targetIndex = 0;
                }

                this.setState({selectedIndex: targetIndex, quantityEditReset: true});
            }

            return;
        }
        if (event.keyCode == 38) {//up key
            event.preventDefault();

            if (this.props.itemList.length > 0) {
                var targetIndex = this.state.selectedIndex - 1;

                if (targetIndex < 0) {
                    targetIndex = this.props.itemList.length - 1;
                }

                this.setState({selectedIndex: targetIndex, quantityEditReset: true});
            }

            return;
        }

        if (event.keyCode == 107 || event.keyCode == 109 || event.keyCode == 110 || event.keyCode == 46 ||
            event.keyCode == 8 || (event.keyCode >= 96 && event.keyCode <= 105) ) {
            var removeItem = false;
            var backspace = false;
            var minusPlus = 0;
            var number = -1;
            var reset = true;

            if (event.keyCode == 107) {//plus key
                event.preventDefault();
                minusPlus = 1;
            }

            if (event.keyCode == 109) {//minus key
                event.preventDefault();
                minusPlus = -1;
            }

            if (event.keyCode == 110 || event.keyCode == 46) {//del, delete key
                event.preventDefault();
                removeItem = true;

                this.setState({
                    quantityEditReset: false
                });
            }

            if (event.keyCode >= 96 && event.keyCode <= 105) {//numpad 0~9 key
                number = event.keyCode - 96;

                if (this.state.quantityEditReset) {
                    reset = true;
                } else {
                    reset = false;
                }

                this.setState({
                    quantityEditReset: false
                });
            }

            if (event.keyCode == 8) {//backspace key
                backspace = true;
            }

            if (number != -1 || minusPlus != 0 || removeItem || backspace) {
                if (this.state.selectedIndex > -1) {
                    this.props.counterKeyActionCallback(this.state.selectedIndex, reset, number, minusPlus, removeItem, backspace);
                }
            }
        }
    },
    clickCallback: function(targetItem){
        var index = this.props.itemList.findIndex(function(item){
            return  (item.key == targetItem.key);
        });

        this.setState({selectedIndex: index, quantityEditReset: true});
    },
    handleKeyPad: function(val) {
        console.log(val);

        var removeItem = false;
        var backspace = false;
        var minusPlus = 0;
        var number = -1;
        var reset = true;

        if (val == 1 || val == 2 || val == 3 || val == 4 || val == 5 || val == 6 || val == 7 || val == 8 || val == 9 || val == 0) {
            //numbers
            number = val;

            if (this.state.quantityEditReset) {
                reset = true;
            } else {
                reset = false;
            }

            this.setState({
                quantityEditReset: false
            });
        }

        if (val == 'backspace') {
            //backspace
            backspace = true;
        }

        if (number != -1 || minusPlus != 0 || removeItem || backspace) {
            if (this.state.selectedIndex > -1) {
                this.props.counterKeyActionCallback(this.state.selectedIndex, reset, number, minusPlus, removeItem, backspace);
            }
        }
    },
    handlePayBtn: function(){
        console.debug('handlePayBtn');

        var variantList = [];

        this.props.itemList.forEach(function(item, i){
            if (item.selectedQuantity > 0) {
                var orderData = {
                    productNo: item.productNo,
                    variantNo: item.variantNo,
                    selectedQuantity: item.selectedQuantity
                };

                variantList.push(orderData);
            }
        });

        if (variantList.length == 0) {
            return;
        }

        var info = this.calculate();

        $('#paymentModal').modal('show');

        var container = $('#paymentModal .modal-body')[0];

        ReactDOM.unmountComponentAtNode(container);

        var PaymentModalFactory = React.createFactory(PaymentModal);
        var _this = this;

        ReactDOM.render(
            PaymentModalFactory({total: info.total, variantList: variantList, callBack: function(orderNo){
                console.log('orderNo:' + orderNo);

                _this.props.printCallback();
            }}),
            container
        );
    },
    handleCancelBtn: function(){
        console.debug('handleCancelBtn');

        this.props.printCallback();
    },
    calculate: function(){
        var price = 0;
        var vat = 0;
        var total = 0;
        var itemCount = 0;

        this.props.itemList.forEach(function(item, i){
            itemCount += item.selectedQuantity;
            total += item.price * item.selectedQuantity;
        });

        if (total > 0) {
            price = total;
            vat = total * 0.1;
        }

        return {
            itemCount: itemCount,
            price: price,
            vat: vat,
            total: total
        }
    },
    render: function(){
        var counterItemList = [];
        var selectedIndex = this.state.selectedIndex;

        this.props.itemList.forEach(function(item, i){
            var isSelected = false;
            if (selectedIndex == i) {
                isSelected = true;
            }
            counterItemList.push(<CounterItem item={item} key={item.key} isSelected={isSelected} clickCallback={this.clickCallback}  />);
        }.bind(this));

        var info = this.calculate();

        var price = numeral(info.price).format('0,0');
        var vat = numeral(info.vat).format('0,0');
        var total = numeral(info.total).format('0,0');

        return (
            <div className="counter-content">
                <div className="counter-item-list" tabIndex="3" onKeyDown={this.handleKeyDown} ref={function(div){this.rootDiv = div;}.bind(this)}>
                    {counterItemList}
                </div>

                <div className="counter-info">
                    <div className="counter-pay-info">
                        <div className="price"><span>Нийт</span> <span>{price}₮</span></div>
                        <div className="vat"><span>НӨАТ</span> <span>{vat}₮</span></div>
                        <div className="total"><span>Төлөх дүн</span> <span>{total}₮</span></div>
                    </div>

                    <div className="counter-pad">
                        <div className="actionpad">
                            <button className="button pay top-border left-border top-left-corner" onClick={this.handlePayBtn}>Төлөх</button>
                            <button className="button cancel left-border bottom-left-corner" onClick={this.handleCancelBtn}>Цуцлах</button>
                        </div>
                        <div className="numpad">
                            <button className="input-button number-char top-border" onClick={this.handleKeyPad.bind(this, 1)}>1</button>
                            <button className="input-button number-char top-border" onClick={this.handleKeyPad.bind(this, 2)}>2</button>
                            <button className="input-button number-char top-border top-right-corner" onClick={this.handleKeyPad.bind(this, 3)}>3</button>
                            <button className="input-button number-char" onClick={this.handleKeyPad.bind(this, 4)}>4</button>
                            <button className="input-button number-char" onClick={this.handleKeyPad.bind(this, 5)}>5</button>
                            <button className="input-button number-char" onClick={this.handleKeyPad.bind(this, 6)}>6</button>
                            <button className="input-button number-char" onClick={this.handleKeyPad.bind(this, 7)}>7</button>
                            <button className="input-button number-char" onClick={this.handleKeyPad.bind(this, 8)}>8</button>
                            <button className="input-button number-char" onClick={this.handleKeyPad.bind(this, 9)}>9</button>
                            <button className="input-button number-char">&nbsp;</button>
                            <button className="input-button number-char" onClick={this.handleKeyPad.bind(this, 0)}>0</button>
                            <button className="input-button number-char bottom-right-corner" onClick={this.handleKeyPad.bind(this, 'backspace')}><i className="fa fa-remove"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

var PosCounter = React.createClass({
    getInitialState: function(){
        return {
            time: moment()
        }
    },
    componentDidMount: function() {
        console.log('key handler set up');
        window.addEventListener('keydown', this.handleKeyDown);

        //set timer
        this.timer = setInterval(function(){
            var time = this.state.time.clone().add(1, 'minutes');

            this.setState({
                time: time
            })
        }.bind(this), 1000 * 60);
    },
    componentWillUnmount: function() {
        window.removeEventListener('keydown', this.handleKeyDown);

        console.log('will unmount');

        clearInterval(this.timer);
        this.timer = null;
    },
    render: function(){
        var displayTime = this.state.time.format('YYYY/MM/DD HH:mm');

        return (
            <div className="mm-pos-counter">
                <div className="counter-header">

                    <div className="row">
                        <div className="col-xs-6">
                            <div className="mm-pos-logo"><img src="img/logo.png" /></div>

                        </div>
                        <div className="col-xs-6">
                            <div>
                                <div className="mm-pos-branch">{this.props.branchName}</div>
                                <div className="mm-pos-date">{displayTime}</div>
                            </div>
                        </div>
                    </div>


                </div>
                <CounterItemList itemList={this.props.itemList} counterKeyActionCallback={this.props.counterKeyActionCallback} printCallback={this.props.printCallback}/>


            </div>
        );
    }
});

