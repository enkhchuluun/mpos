var NumberPicker = React.createClass({
    propTypes:{
        name : React.PropTypes.string,
        value : React.PropTypes.number,
        width: React.PropTypes.number,
        min: React.PropTypes.number,
        max: React.PropTypes.number,
        step: React.PropTypes.number,
        onChange: React.PropTypes.func
    },
    getInitialState: function(){
        var value = (typeof this.props.value != 'undefined') ? parseInt(this.props.value) : 0;

        return {
          value : value
        }
    },
    handleClick: function(index, event){
        event.preventDefault();
        this.props.onRemoveSelectedItem(index);
    },
    handleTextChange: function (event) {
        var value = event.target.value;
        value = parseInt(value);
        if (value) {
            this.setState({
              value: value
            });
        }
    },
    handleKeyDown: function(event) {
        if (event.keyCode == 38) {
            this.handleAction('up');
        }
        if (event.keyCode == 40) {
            this.handleAction('down');
        }
    },
    handleAction: function(action) {
        var step = (typeof this.props.step != 'undefined') ? parseInt(this.props.step) : 1;
        var max = (typeof this.props.max != 'undefined') ? parseInt(this.props.max) : NaN;
        var min = (typeof this.props.min != 'undefined') ? parseInt(this.props.min) : NaN;
        var inputEl = ReactDOM.findDOMNode(this.refs.inputQuantity);


        if (action == 'up') {
            var value = this.state.value + step;

            if (!isNaN(max) && value > max) {
                value = max;
            }

            this.setState({
              value: value
            });

            if (this.props.onChange) {

                this.props.onChange(value, inputEl);
            }
        }
        if (action == 'down') {
            var value = this.state.value - step;
            if (!isNaN(min) && value < min) {
                value = min;
            }

            this.setState({
              value: value
            });

            if (this.props.onChange) {
                this.props.onChange(value, inputEl);
            }
        }

    },
    render: function(){
        return (
          <div className="mm-number-picker input-group">
            <input type="text" value={this.state.value} ref="inputQuantity" name={this.props.name} className="form-control" onChange={this.handleTextChange} onKeyDown={this.handleKeyDown} />
            <span className="input-group-btn">
                <button type="button" className="btn btn-default btn-xs" onClick={this.handleAction.bind(this, 'up')}><i className="fa fa-caret-up"></i></button>
                <button type="button" className="btn btn-default btn-xs" onClick={this.handleAction.bind(this, 'down')}><i className="fa fa-caret-down"></i></button>
            </span>

          </div>
        );
    }
});
