import { connect } from 'react-redux'

import { profile } from './actions'
import Home from './Home'
 
const mapStateToProps = state => ({
  status: state.status
})
 
const mapDispatchToProps = (dispatch) => {
  return { actions: bindActionCreators(profile, dispatch) }
} 
 
const Container= connect(
  mapStateToProps,
  mapDispatchToProps
)(Home)

export default Container;