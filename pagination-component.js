export default {
  methods: {
    clickPage (page) {
      this.$emit('changePage', page);
    }
  },
  props: ['totalPages', 'currentPage', 'hasPrePage', 'hasNextPage'],
  template: `
    <nav aria-label="Page navigation example">
      <ul class="pagination">
        <li class="page-item" v-if="hasPrePage" @click.prevent="clickPage(currentPage-1)">
          <a class="page-link" href="#" aria-label="Previous">
            <span aria-hidden="true">&laquo;</span>
          </a>
        </li>
        <li class="page-item" :class="{active: currentPage === number}" v-for="number in totalPages" :key="number">
          <a class="page-link" href="javascript:;" @click="clickPage(number)">{{number}}</a>
        </li>
        <li class="page-item" v-if="hasNextPage" @click.prevent="clickPage(currentPage+1)">
          <a class="page-link" href="#" aria-label="Next">
            <span aria-hidden="true">&raquo;</span>
          </a>
        </li>
      </ul>
    </nav>
  `
}