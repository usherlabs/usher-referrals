import {expect, test} from '@oclif/test'

describe('arcampaigns:ls', () => {
  test
  .stdout()
  .command(['arcampaigns:ls'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['arcampaigns:ls', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})
