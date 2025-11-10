use anchor_lang::prelude::*;

declare_id!("2Hg6qeZGBsMPDDM1RY65Ucwk5JbLrF3D3P9qdYbEfmSU");

#[program]
pub mod guitar_contest {
    use super::*;

    /*
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
    */

    /// Instruction 1: Creates a new SubmissionAccount to host a video
    pub fn create_submission(
        ctx: Context<CreateSubmission>,
        title: String,
        youtube_id: String,
    ) -> Result<()> {
        // We get the account to create from our context
        let submission = &mut ctx.accounts.submission;

        // Set the data on the new account
        submission.contestant = ctx.accounts.user.key(); // The user who submitted it
        submission.title = title;
        submission.youtube_id = youtube_id;
        submission.vote_count = 0; // Start with 0 votes

        msg!("New submission created by: {}", ctx.accounts.user.key());
        msg!("Title: {}", submission.title);
        msg!("YouTube ID: {}", submission.youtube_id);
        Ok(())
    }

    /// Instruction 2: Allows a user to vote for a submission.
    /// This instruction uses a PDA (VoteReceipt) to prevent double voting.
    pub fn vote(ctx: Context<Vote>) -> Result<()> {
        // We get the submission account from the context and increment its vote count
        let submission = &mut ctx.accounts.submission;
        submission.vote_count = submission.vote_count.checked_add(1).unwrap();

        // The `VoteReceipt` account is created by the `#[account(init...)]`
        // macro in the Vote context below.
        // If the user tries to vote again, the program will fail trying
        // to create this account because it already exists (PDA collision).
        
        msg!("Vote successful for submission: {}", submission.key());
        msg!("Total votes: {}", submission.vote_count);
        Ok(())
    }
}

// -----------------------------------------------------------------
// 1. ACCOUNTS & CONTEXTS FOR 'create_submission'
// -----------------------------------------------------------------
#[derive(Accounts)]
pub struct CreateSubmission<'info> {
    // This creates (initializes) a new account.
    // We are defining its space: 8 bytes for the "discriminator"
    // + 32 for the contestant's Pubkey
    // + (4 + 50) for the title string (max 50 chars)
    // + (4 + 20) for the YouTube ID string (max 20 chars)
    // + 8 for the vote_count (u64)
    #[account(
        init,
        payer = user,
        space = 8 + 32 + (4 + 50) + (4 + 20) + 8 
    )]
    pub submission: Account<'info, SubmissionAccount>,

    // The 'user' is the person paying for the account's rent
    #[account(mut)]
    pub user: Signer<'info>,
    
    // The System Program is required by Solana to create new accounts
    pub system_program: Program<'info, System>,
}

// This is the data structure for our SubmissionAccount
#[account]
pub struct SubmissionAccount {
    pub contestant: Pubkey,
    pub title: String,
    pub youtube_id: String,
    pub vote_count: u64,
}

// -----------------------------------------------------------------
// 2. ACCOUNTS & CONTEXTS FOR 'vote'
// -----------------------------------------------------------------
#[derive(Accounts)]
pub struct Vote<'info> {
    // We mark the submission as 'mut' because we are changing its `vote_count`
    #[account(mut)]
    pub submission: Account<'info, SubmissionAccount>,

    // This is our "vote-once" PDA receipt.
    // It's an empty account that we create.
    // Its unique address (PDA) is "derived" from two "seeds":
    // 1. The user's public key
    // 2. The submission's public key
    // This means a specific user can only create this account ONCE
    // for a specific submission.
    //
    #[account(
        init,
        payer = user,
        space = 8, // 8 bytes for the discriminator
        seeds = [user.key().as_ref(), submission.key().as_ref()],
        bump
    )]
    pub vote_receipt: Account<'info, VoteReceipt>,

    // The 'user' is the voter
    #[account(mut)]
    pub user: Signer<'info>,

    // The System Program is required to create the receipt account
    pub system_program: Program<'info, System>,
}

// This is the data structure for our receipt (it's empty)
#[account]
pub struct VoteReceipt {}

/*
#[derive(Accounts)]
pub struct Initialize {}
*/