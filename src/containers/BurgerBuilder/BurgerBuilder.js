import React, { Component } from 'react';

import Aux from '../../hoc/Aux';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/BuildControls/OrderSummary/OrderSummary';
import axios from '../../axios-orders';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';
import Spinner from '../../components/UI/Spinner/Spinner';

const INGREDIENT_PRICES = {
    salad:0.5,
    cheese:0.4,
    meat:1.3,
    bacon:0.7
}
class BurgerBuilder extends Component {
   /*  constructor(){
        super(props);
        this.state={...}
    } */
    
    state={
        ingredients:null,
        totalPrice:4,
        purchasable:false,
        purchasing:false,
        loading:false,
        error:false
    }
 
    componentDidMount(){
        axios.get('https://react-my-burger-794c5.firebaseio.com/ingredients.json')
        .then(response=>{
              this.setState({ingredients:response.data});      
        })
        .catch(error=>{
            this.setState({error:true});
        });
    } 

    updatePurchaseState =(ingredients)=>{
        const sum =Object.keys(ingredients)
        .map(igKey=>{
            return ingredients[igKey];
        })
        .reduce((sum,el)=>{
            return sum+el;
        },0);
        this.setState({purchasable:sum >0});
    }
    addIngredientHandler =(type) => {
        const oldCount =this.state.ingredients[type];
        const updatedCount=oldCount +1;
        const updatedIngredients ={
            ...this.state.ingredients
        };
        updatedIngredients[type]=updatedCount;
        const priceAddition=INGREDIENT_PRICES[type];
        const oldPrice =this.state.totalPrice;
        const newPrice =oldPrice +priceAddition;
        this.setState({totalPrice:newPrice, ingredients:updatedIngredients})
        this.updatePurchaseState(updatedIngredients);
    }

    removeIngredientHandler =(type) => {
        const oldCount =this.state.ingredients[type];
        if(oldCount<=0){
            return; 
        }
        const updatedCount=oldCount -1;
        const updatedIngredients ={
            ...this.state.ingredients
        };
        updatedIngredients[type]=updatedCount;
        const priceDeduction=INGREDIENT_PRICES[type];
        const oldPrice =this.state.totalPrice;
        const newPrice =oldPrice -priceDeduction;
        this.setState({totalPrice:newPrice, ingredients:updatedIngredients})
        this.updatePurchaseState(updatedIngredients);
    }

    purchaseHandler=()=>{
        this.setState({purchasing:true});
    }

    modalClosedHandler=()=>{
        this.setState({purchasing:false});
    }

    purchaseContinueHandler=()=>{
        //alert('You continue');
        this.setState({loading:true});
        const order={
            ingredients:this.state.ingredients,
            price:this.state.totalPrice,
            customer:{
                name:'Ilias Gravvanis',
                address:{
                    street:'Pergamou',
                    zipCode:'41335',
                    country:'Greece'
                },
                email:'iliophanis@gmail.com'
            },
            deliveryMethod:'fastest'
        }
        axios.post('/orders.json',order)
        .then( response=>{
            this.setState({loading:false,purchasing:false});
        })
        .catch(error =>
            {
                this.setState({loading:false,purchasing:false});
            });
    }
    render() {
        const disabledInfo ={
            ...this.state.ingredients//copy object ingredients
        };
        for (let key in disabledInfo){
            disabledInfo[key]=disabledInfo[key]<=0//return true or false
        }
        let orderSummary=null;
        let burger =this.state.error ?<p>Ingredients cant be loaded</p> :<Spinner/>;
        if(this.state.ingredients){
             burger=(
                <Aux>
                <Burger ingredients={this.state.ingredients}/>
                <BuildControls 
                ingredientAdded={this.addIngredientHandler}
                ingredientRemoved={this.removeIngredientHandler}
                disabled={disabledInfo}
                ordered={this.purchaseHandler}
                purchasable={this.state.purchasable}
                price={this.state.totalPrice}/>
                </Aux>
            );
            orderSummary=<OrderSummary
            ingredients={this.state.ingredients}
            purchaseCancelled={this.modalClosedHandler}
            purchaseContinued={this.purchaseContinueHandler}
            price={this.state.totalPrice}/>;

        }
       if(this.state.loading){
            orderSummary=<Spinner/>;
        } 
        //{salad:true, meat:false,...}
         return (
            <Aux>
                
                <Modal show={this.state.purchasing} modalClosed={this.modalClosedHandler}>=>
                    {orderSummary}
                </Modal>
                {burger}
            </Aux>
            );
    };
}
 
export default withErrorHandler(BurgerBuilder,axios);