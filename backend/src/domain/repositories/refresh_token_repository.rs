use async_trait::async_trait;
use chrono::{DateTime, Utc};

use crate::domain::value_objects::WalletAddress;

#[derive(Debug, Clone)]
pub struct RefreshTokenRecord {
    pub id: String,
    pub wallet_address: WalletAddress,
    pub token_hash: String,
    pub expires_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
}

#[async_trait]
pub trait RefreshTokenRepository: Send + Sync {
    async fn store_refresh_token(&self, record: RefreshTokenRecord) -> Result<(), Box<dyn std::error::Error>>;
    async fn get_refresh_token(&self, token_hash: &str) -> Result<Option<RefreshTokenRecord>, Box<dyn std::error::Error>>;
    async fn revoke_refresh_token(&self, token_hash: &str) -> Result<(), Box<dyn std::error::Error>>;
    async fn revoke_all_user_tokens(&self, wallet_address: &WalletAddress) -> Result<(), Box<dyn std::error::Error>>;
    async fn cleanup_expired_tokens(&self) -> Result<(), Box<dyn std::error::Error>>;
}