import React from 'react';
import {Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import AuthContext from './AuthContext';

function SecureRoute({component: Component, scopes, ...rest}){
    return (
        <AuthContext.Consumer>
            {auth =>(
        <Route
            {...rest}
            render={props => {
                // Redirect to login if not logged in
                if(!auth.isAuthenticated()) return auth.login();
                //Display message if user lacks the required scope(s)
                if(scopes.length > 0 && !auth.userHasScopes(scopes)){
                    return (
                        <h1>
                            Unauthorized - You need the following scope(s) to view this page: {""}
                            {scopes.join(",")}.
                        </h1>
                    );
                }
                //Render component
                return <Component auth={auth} {...props} />
            }}
        />
        )
        }
        </AuthContext.Consumer>
    );
}

SecureRoute.propTypes = {
    component: PropTypes.func.isRequired,
    scopes: PropTypes.array
};

SecureRoute.defaultProps = {
    scopes: []
};

export default SecureRoute;