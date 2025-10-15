use std::sync::Arc;

use crate::domain::repositories::RefreshTokenRepository;
use crate::domain::services::jwt_service::JwtService;
use crate::domain::value_objects::WalletAddress;

#[derive(Debug)]
pub struct RefreshTokenCommand {
    pub refresh_token: String,
}

#[derive(Debug)]
pub struct RefreshTokenResponse {
    pub access_token: String,
    pub refresh_token: String,
    pub expires_in: i64,
}

pub async fn refresh_token(
    refresh_token_repository: Arc<dyn RefreshTokenRepository>,
    jwt_service: Arc<dyn JwtService>,
    command: RefreshTokenCommand,
) -> Result<RefreshTokenResponse, Box<dyn std::error::Error>> {
    // Validate the refresh token
    let refresh_token_data = jwt_service.validate_refresh_token(&command.refresh_token).await?;

    // Check if token exists in database
    let stored_token = refresh_token_repository
        .get_refresh_token(&refresh_token_data.token_hash)
        .await?;

    if stored_token.is_none() {
        return Err("Invalid refresh token".into());
    }

    // Revoke the old refresh token
    refresh_token_repository.revoke_refresh_token(&refresh_token_data.token_hash).await?;

    // Generate new token pair
    let token_pair = jwt_service.generate_token_pair(&refresh_token_data.wallet_address).await?;

    // Store new refresh token
    let new_refresh_token_data = jwt_service.validate_refresh_token(&token_pair.refresh_token).await?;
    refresh_token_repository.store_refresh_token(new_refresh_token_data).await?;

    Ok(RefreshTokenResponse {
        access_token: token_pair.access_token,
        refresh_token: token_pair.refresh_token,
        expires_in: token_pair.expires_in,
    })
}