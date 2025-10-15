use std::sync::Arc;

use crate::domain::repositories::{ProfileRepository, RefreshTokenRepository};
use crate::domain::services::{auth_service::AuthService, jwt_service::JwtService};
use crate::domain::value_objects::WalletAddress;

#[derive(Debug)]
pub struct LoginCommand {
    pub address: String,
    pub signature: String,
    pub nonce: i64,
}

#[derive(Debug)]
pub struct LoginResponse {
    pub access_token: String,
    pub refresh_token: String,
    pub expires_in: i64,
}

pub async fn login(
    profile_repository: Arc<dyn ProfileRepository>,
    refresh_token_repository: Arc<dyn RefreshTokenRepository>,
    auth_service: Arc<dyn AuthService>,
    jwt_service: Arc<dyn JwtService>,
    command: LoginCommand,
) -> Result<LoginResponse, Box<dyn std::error::Error>> {
    let wallet_address = WalletAddress(command.address.clone());

    // Verify the signature
    let challenge = crate::domain::services::auth_service::AuthChallenge {
        address: command.address,
        nonce: command.nonce,
    };

    let auth_result = auth_service.verify_signature(&challenge, &command.signature).await?;

    if auth_result.is_none() {
        return Err("Invalid signature".into());
    }

    // Generate token pair
    let token_pair = jwt_service.generate_token_pair(&wallet_address).await?;

    // Store refresh token
    // let refresh_token_data = jwt_service.validate_refresh_token(&token_pair.refresh_token).await?;
    // refresh_token_repository.store_refresh_token(refresh_token_data).await?;

    Ok(LoginResponse {
        access_token: token_pair.access_token,
        refresh_token: token_pair.refresh_token,
        expires_in: token_pair.expires_in,
    })
}