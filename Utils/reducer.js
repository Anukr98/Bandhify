import actions from "../constants/actions"

export const initialState = {
    deliveryFee : 0,
    payable: 0,
    cutOffValue: 0,
    discount: 0,
    firebaseFCMToken: null
}

const reducer = (state,action) => {

    // console.log("Action type",action.type)
    // console.log("Payload",action.payload)

    switch(action.type) {
        case actions.SET_PAYABLE :
            const { payable, delivery, discount } = action.payload
            return {
                ...state,
                payable,
                deliveryFee: delivery,
                discount
            }

        case actions.SET_CUTOFF_VALUE:
            return {
                ...state,
                cutOffValue: action.payload.cutoff
            }

        case actions.SET_FIREBASE_TOKEN:
            return {
                ...state,
                firebaseFCMToken: action.payload.token
            }

        default:
            return state
    }
}

export default reducer